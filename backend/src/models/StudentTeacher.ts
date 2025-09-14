import mongoose, { Document, Schema } from "mongoose";

export interface IStudentTeacher extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const studentTeacherSchema = new Schema<IStudentTeacher>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Aynı öğrenci-öğretmen kombinasyonunun tekrar oluşturulmasını engelle
studentTeacherSchema.index({ studentId: 1, teacherId: 1 }, { unique: true });

export const StudentTeacher = mongoose.model<IStudentTeacher>(
  "StudentTeacher",
  studentTeacherSchema
);
