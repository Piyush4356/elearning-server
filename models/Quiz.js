import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    validate: (v) => v.length === 4,
    required: true,
  },
  correctAnswer: { type: Number, min: 0, max: 3, required: true }, // index into options[]
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true,
    },
    afterLectureIndex: {
      type: Number,
      required: true, // 3, 6, 9, 12 …
    },
    title: {
      type: String,
      default: "",
    },
    questions: {
      type: [questionSchema],
      validate: (v) => v.length >= 1,
    },
    passingScore: {
      type: Number,
      default: 60, // percentage
    },
  },
  { timestamps: true }
);

// Compound unique — one quiz per course per checkpoint
quizSchema.index({ course: 1, afterLectureIndex: 1 }, { unique: true });

export const Quiz = mongoose.model("Quiz", quizSchema);
