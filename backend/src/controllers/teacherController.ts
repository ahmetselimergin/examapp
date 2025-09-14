import { User } from "../models/User";
import { StudentTeacher } from "../models/StudentTeacher";
import { Request, Response } from "express";

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const assignStudentToTeacher = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const { studentId } = req.body;

    // Check if teacher and student exist
    const teacher = await User.findById(teacherId);
    const student = await User.findById(studentId);

    if (!teacher || !student) {
      return res
        .status(404)
        .json({ message: "Öğretmen veya öğrenci bulunamadı" });
    }

    if (teacher.role !== "teacher") {
      return res
        .status(400)
        .json({ message: "Seçilen kullanıcı öğretmen değil" });
    }

    if (student.role !== "student") {
      return res
        .status(400)
        .json({ message: "Seçilen kullanıcı öğrenci değil" });
    }

    // Check if assignment already exists
    const existingAssignment = await StudentTeacher.findOne({
      studentId,
      teacherId,
    });

    if (existingAssignment) {
      return res
        .status(400)
        .json({ message: "Bu öğrenci zaten bu öğretmene atanmış" });
    }

    // Create new assignment
    await StudentTeacher.create({
      studentId,
      teacherId,
    });

    res.json({ message: "Öğrenci başarıyla öğretmene atandı" });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Bu öğrenci zaten bu öğretmene atanmış" });
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const removeStudentFromTeacher = async (req: Request, res: Response) => {
  try {
    const { teacherId, studentId } = req.params;

    const result = await StudentTeacher.findOneAndDelete({
      studentId,
      teacherId,
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Öğrenci-öğretmen ataması bulunamadı" });
    }

    res.json({ message: "Öğrenci öğretmenden kaldırıldı" });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Get all teachers for a specific student
export const getTeachersForStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const assignments = await StudentTeacher.find({ studentId })
      .populate("teacherId", "name email")
      .select("teacherId assignedAt");

    const teachers = assignments.map((assignment) => ({
      ...(assignment.teacherId as any).toObject(),
      assignedAt: assignment.assignedAt,
    }));

    res.json(teachers);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Get all students for a specific teacher
export const getStudentsForTeacher = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const assignments = await StudentTeacher.find({ teacherId })
      .populate("studentId", "name email")
      .select("studentId assignedAt");

    const students = assignments.map((assignment) => ({
      ...(assignment.studentId as any).toObject(),
      assignedAt: assignment.assignedAt,
    }));

    res.json(students);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};
