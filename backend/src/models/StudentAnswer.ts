import mongoose, { Document, Schema } from "mongoose";

export interface IStudentAnswer extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  attemptNumber: number; // Kaçıncı deneme
  response: string | string[]; // Öğrencinin cevabı
  score?: number; // Öğretmenin verdiği puan (0-100)
  isCorrect?: boolean; // Otomatik kontrol için
  submittedAt: Date;
}

const studentAnswerSchema = new Schema<IStudentAnswer>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    response: {
      type: Schema.Types.Mixed, // string veya array olabilir
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    isCorrect: {
      type: Boolean,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Aynı öğrencinin aynı sınavdaki aynı soruya aynı attempt'ta birden fazla cevap vermesini engelle
studentAnswerSchema.index(
  { examId: 1, studentId: 1, questionId: 1, attemptNumber: 1 },
  { unique: true }
);

export default mongoose.model<IStudentAnswer>(
  "StudentAnswer",
  studentAnswerSchema
);
