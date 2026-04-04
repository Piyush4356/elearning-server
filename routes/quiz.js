import express from "express";
import {
  checkQuiz,
  submitQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  getQuizDetail,
  getQuizAttempts,
  resetUserQuiz,
} from "../controllers/quiz.js";
import { isAuth, isAdmin, isAdminOrTester } from "../middleware/isAuth.js";

const router = express.Router();

// ── Student routes ────────────────────────────────────────────────────────────
router.get("/quiz/check/:courseId", isAuth, checkQuiz);
router.post("/quiz/:quizId/submit", isAuth, submitQuiz);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/admin/quiz/attempts/:quizId", isAuth, isAdminOrTester, getQuizAttempts);
router.get("/admin/quiz/detail/:quizId", isAuth, isAdminOrTester, getQuizDetail);
router.get("/admin/quiz/:courseId", isAuth, isAdminOrTester, getCourseQuizzes);
router.post("/admin/quiz", isAuth, isAdmin, createQuiz);
router.put("/admin/quiz/:quizId", isAuth, isAdmin, updateQuiz);
router.delete("/admin/quiz/reset/:quizId/user/:userId", isAuth, isAdmin, resetUserQuiz);
router.delete("/admin/quiz/:quizId", isAuth, isAdmin, deleteQuiz);

export default router;
