import mongoose, { Document, Schema } from "mongoose";

export interface IExamAttempt extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  attemptNumber: number; // Kaçıncı deneme (1, 2, 3...)
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  score?: number; // Final puanı
  createdAt: Date;
  updatedAt: Date;
}

const examAttemptSchema = new Schema<IExamAttempt>(
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
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Aynı öğrencinin aynı sınavda aynı attempt numarasıyla birden fazla kayıt oluşturmasını engelle
examAttemptSchema.index(
  { examId: 1, studentId: 1, attemptNumber: 1 },
  { unique: true }
);

export default mongoose.model<IExamAttempt>("ExamAttempt", examAttemptSchema);
