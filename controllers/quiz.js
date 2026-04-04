import TryCatch from "../middleware/TryCatch.js";
import { Quiz } from "../models/Quiz.js";
import { Progress } from "../models/Progress.js";
import { Lecture } from "../models/Lecture.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get a user's progress doc (or null)
// ─────────────────────────────────────────────────────────────────────────────
async function getUserProgress(userId, courseId) {
  return Progress.findOne({ user: userId, course: courseId });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quiz/check/:courseId
// Returns quiz status for the current user in this course
// ─────────────────────────────────────────────────────────────────────────────
export const checkQuiz = TryCatch(async (req, res) => {
  const { courseId } = req.params;

  // Get all quizzes for this course sorted by checkpoint
  const allQuizzes = await Quiz.find({ course: courseId }).sort({ afterLectureIndex: 1 });
  const allCheckpoints = allQuizzes.map((q) => q.afterLectureIndex);

  // If no quizzes exist → nothing to show
  if (allCheckpoints.length === 0) {
    return res.json({ quizDue: false, quiz: null, maxUnlocked: Infinity, passedCount: 0 });
  }

  const progress = await getUserProgress(req.user._id, courseId);
  const quizzesTaken = progress?.quizzesTaken || [];
  const passedSet = new Set(
    quizzesTaken.filter((q) => q.passed).map((q) => q.afterLectureIndex)
  );

  // Compute maxUnlocked — first un-passed checkpoint is the lock boundary
  let maxUnlocked = Infinity;
  for (const checkpoint of allCheckpoints) {
    if (!passedSet.has(checkpoint)) {
      maxUnlocked = checkpoint;
      break;
    }
  }

  const completedCount = progress?.completedLectures?.length ?? 0;

  // Always return first UNPASSED quiz OR the last passed quiz for review
  const firstUnpassed = allQuizzes.find((q) => !passedSet.has(q.afterLectureIndex));
  if (firstUnpassed) {
    const quizDue = completedCount >= firstUnpassed.afterLectureIndex;
    return res.json({
      quizDue,
      quiz: firstUnpassed,
      maxUnlocked,
      passedCount: passedSet.size,
      triggerIndex: firstUnpassed.afterLectureIndex,
    });
  }

  // All quizzes passed — return last quiz with saved results for review tab
  const lastPassedQuiz = [...allQuizzes].reverse().find((q) => passedSet.has(q.afterLectureIndex));
  if (lastPassedQuiz) {
    const attempt = quizzesTaken.find((q) => q.afterLectureIndex === lastPassedQuiz.afterLectureIndex);
    return res.json({
      quizDue: false,
      quizAlreadyPassed: true,
      quiz: lastPassedQuiz,
      savedResult: attempt
        ? {
            score: attempt.score,
            total: attempt.total,
            scorePercent: attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0,
            passed: attempt.passed,
            passingScore: lastPassedQuiz.passingScore,
            results: attempt.results || [],
            maxUnlocked,
          }
        : null,
      maxUnlocked,
      passedCount: passedSet.size,
    });
  }

  // Fallback (no quizzes at all)
  res.json({ quizDue: false, quiz: null, maxUnlocked, passedCount: passedSet.size });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quiz/:quizId/submit
// Body: { answers: [0, 2, 1, 3, 2], courseId }
// ─────────────────────────────────────────────────────────────────────────────
export const submitQuiz = TryCatch(async (req, res) => {
  const { quizId } = req.params;
  const { answers, courseId } = req.body;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  // Score it
  let correct = 0;
  const results = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) correct++;
    return {
      questionText: q.questionText,
      selectedAnswer: answers[i],
      correctAnswer: q.correctAnswer,
      options: q.options,
      explanation: q.explanation,
      isCorrect,
    };
  });

  const total = quiz.questions.length;
  const scorePercent = Math.round((correct / total) * 100);
  const passed = scorePercent >= quiz.passingScore;

  // Save to Progress
  let progress = await getUserProgress(req.user._id, courseId || quiz.course);
  if (!progress) {
    progress = await Progress.create({
      user: req.user._id,
      course: courseId || quiz.course,
      completedLectures: [],
      quizzesTaken: [],
    });
  }

  // Remove any previous attempt at this checkpoint (allow retake to overwrite)
  progress.quizzesTaken = progress.quizzesTaken.filter(
    (q) => q.afterLectureIndex !== quiz.afterLectureIndex
  );

  progress.quizzesTaken.push({
    quizId: quiz._id,
    afterLectureIndex: quiz.afterLectureIndex,
    score: correct,
    total,
    passed,
    attemptedAt: new Date(),
    results, // persist full per-question breakdown for post-refresh review
  });

  await progress.save();

  // Compute new maxUnlocked using actual quiz checkpoints (not hardcoded multiples of 3)
  const allQuizzes = await Quiz.find({ course: courseId || quiz.course }).sort({ afterLectureIndex: 1 });
  const allCheckpoints = allQuizzes.map((q) => q.afterLectureIndex);
  const passedSet = new Set(
    progress.quizzesTaken.filter((q) => q.passed).map((q) => q.afterLectureIndex)
  );
  let newMaxUnlocked = Infinity;
  for (const checkpoint of allCheckpoints) {
    if (!passedSet.has(checkpoint)) {
      newMaxUnlocked = checkpoint;
      break;
    }
  }

  res.json({
    score: correct,
    total,
    scorePercent,
    passed,
    passingScore: quiz.passingScore,
    results,
    maxUnlocked: newMaxUnlocked,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── POST /api/admin/quiz
// Body: { courseId, afterLectureIndex, title, questions[], passingScore }
// ─────────────────────────────────────────────────────────────────────────────
export const createQuiz = TryCatch(async (req, res) => {
  const { courseId, afterLectureIndex, title, questions, passingScore } = req.body;

  if (!courseId || !afterLectureIndex || !questions?.length) {
    return res.status(400).json({ message: "courseId, afterLectureIndex, and questions are required" });
  }
  if (afterLectureIndex < 1) {
    return res.status(400).json({ message: "afterLectureIndex must be at least 1" });
  }

  const quiz = await Quiz.create({
    course: courseId,
    afterLectureIndex,
    title: title || `Quiz after lecture ${afterLectureIndex}`,
    questions,
    passingScore: passingScore || 60,
  });

  res.status(201).json({ message: "Quiz created successfully", quiz });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── PUT /api/admin/quiz/:quizId
// ─────────────────────────────────────────────────────────────────────────────
export const updateQuiz = TryCatch(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json({ message: "Quiz updated", quiz });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── DELETE /api/admin/quiz/:quizId
// ─────────────────────────────────────────────────────────────────────────────
export const deleteQuiz = TryCatch(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.quizId);
  res.json({ message: "Quiz deleted" });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── GET /api/admin/quiz/:courseId
// Returns all quizzes for a course + pass/fail stats
// ─────────────────────────────────────────────────────────────────────────────
export const getCourseQuizzes = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const quizzes = await Quiz.find({ course: courseId }).sort({ afterLectureIndex: 1 });

  // Aggregate stats from Progress
  const allProgress = await Progress.find({ course: courseId });

  const stats = quizzes.map((quiz) => {
    let attempts = 0, passes = 0;
    allProgress.forEach((p) => {
      const attempt = (p.quizzesTaken || []).find(
        (q) => q.afterLectureIndex === quiz.afterLectureIndex
      );
      if (attempt) {
        attempts++;
        if (attempt.passed) passes++;
      }
    });
    return {
      quizId: quiz._id,
      afterLectureIndex: quiz.afterLectureIndex,
      title: quiz.title,
      questionCount: quiz.questions.length,
      passingScore: quiz.passingScore,
      totalAttempts: attempts,
      totalPassed: passes,
      passRate: attempts > 0 ? Math.round((passes / attempts) * 100) : null,
    };
  });

  res.json({ quizzes, stats });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── GET /api/admin/quiz/detail/:quizId
// Returns a single quiz with full questions (for editing)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── GET /api/admin/quiz/attempts/:quizId
// Returns all student attempts for a specific quiz with names & scores
// ─────────────────────────────────────────────────────────────────────────────
export const getQuizAttempts = TryCatch(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  const allProgress = await Progress.find({ course: quiz.course }).populate("user", "name email _id");

  const attempts = [];
  allProgress.forEach((p) => {
    if (!p.user) return; // skip orphaned progress
    const attempt = (p.quizzesTaken || []).find(
      (q) => q.afterLectureIndex === quiz.afterLectureIndex
    );
    if (attempt) {
      attempts.push({
        userId: p.user._id,
        name: p.user.name,
        email: p.user.email,
        score: attempt.score,
        total: attempt.total,
        scorePercent: attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0,
        passed: attempt.passed,
        attemptedAt: attempt.attemptedAt,
      });
    }
  });

  // Sort newest first
  attempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

  res.json({ attempts, quiz });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── DELETE /api/admin/quiz/reset/:quizId/user/:userId
// Wipes a user's attempt so they can retake the quiz
// ─────────────────────────────────────────────────────────────────────────────
export const resetUserQuiz = TryCatch(async (req, res) => {
  const { quizId, userId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  const progress = await Progress.findOne({ user: userId, course: quiz.course });
  if (!progress) return res.status(404).json({ message: "No progress found for this user" });

  const before = progress.quizzesTaken.length;
  progress.quizzesTaken = progress.quizzesTaken.filter(
    (q) => q.afterLectureIndex !== quiz.afterLectureIndex
  );

  if (progress.quizzesTaken.length === before) {
    return res.status(404).json({ message: "No attempt found at this checkpoint" });
  }

  await progress.save();
  res.json({ message: "Quiz reset successfully. The student can now retake it." });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ── GET /api/admin/quiz/detail/:quizId
// Returns a single quiz with full questions (for editing)
// ─────────────────────────────────────────────────────────────────────────────
export const getQuizDetail = TryCatch(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json({ quiz });
});
