import express from "express";
import {
  assignStudentToTeacher,
  getAllTeachers,
  removeStudentFromTeacher,
  getTeachersForStudent,
  getStudentsForTeacher,
} from "../controllers/teacherController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Tüm öğretmenleri getir
router.get("/", auth, getAllTeachers);

// Bir öğrencinin tüm öğretmenlerini getir (specific route first)
router.get("/student/:studentId/teachers", auth, getTeachersForStudent);

// Bir öğretmenin tüm öğrencilerini getir (generic route after specific)
router.get("/:teacherId/students", auth, getStudentsForTeacher);

// Öğrenciyi öğretmene ata
router.post("/:teacherId/students", auth, assignStudentToTeacher);

// Öğrenciyi öğretmenden kaldır
router.delete(
  "/:teacherId/students/:studentId",
  auth,
  removeStudentFromTeacher
);

export default router;
