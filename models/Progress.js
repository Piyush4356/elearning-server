import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
    },
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lectures",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    quizzesTaken: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        afterLectureIndex: { type: Number },
        score: { type: Number },
        total: { type: Number },
        passed: { type: Boolean },
        attemptedAt: { type: Date, default: Date.now },
        // Full per-question breakdown — persisted for post-refresh review
        results: [
          {
            questionText: String,
            selectedAnswer: Number,
            correctAnswer: Number,
            options: [String],
            explanation: String,
            isCorrect: Boolean,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Progress = mongoose.model("Progress", schema);