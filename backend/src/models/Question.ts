import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  examId: mongoose.Types.ObjectId;
  type: string;
  text: string;
  options: string[];
  editorData?: any; // Rich text content from Editor.js
  correctAnswers: string[];
  difficulty: string;
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  examId: {
    type: Schema.Types.ObjectId,
    ref: "Exam",
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
    },
  ],
  editorData: {
    type: Schema.Types.Mixed,
    required: false,
  },
  correctAnswers: [
    {
      type: String,
    },
  ],
  difficulty: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IQuestion>("Question", questionSchema);
