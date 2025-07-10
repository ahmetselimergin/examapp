import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // dakika cinsinden
  createdBy: mongoose.Types.ObjectId;
  questions: mongoose.Types.ObjectId[];
  assignedStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isFinished: boolean;
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    assignedStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFinished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExam>("Exam", examSchema);
