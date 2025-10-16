import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // dakika cinsinden
  questionCount: number; // soru sayısı
  attemptLimit: number; // kaç defa girme hakkı
  createdBy: mongoose.Types.ObjectId;
  questions: {
    questionId: mongoose.Types.ObjectId;
    points: number;
  }[];
  assignedStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isFinished: boolean;
  finishedAt?: Date;
}

const examSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      default: 0,
    },
    attemptLimit: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        points: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFinished: { type: Boolean, default: false },
    finishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExam>("Exam", examSchema);
