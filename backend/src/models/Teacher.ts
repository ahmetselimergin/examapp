import mongoose, { Document, Schema } from "mongoose";
//import Student from "./Student";

export interface ITeacher extends Document {
  name: string;
  surname: string;
  email: string;
  department: string;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITeacher>("Teacher", teacherSchema);
