"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentsForTeacher = exports.getTeachersForStudent = exports.removeStudentFromTeacher = exports.assignStudentToTeacher = exports.getAllTeachers = void 0;
const User_1 = require("../models/User");
const StudentTeacher_1 = require("../models/StudentTeacher");
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User_1.User.find({ role: "teacher" }).select("-password");
        res.json(teachers);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.getAllTeachers = getAllTeachers;
const assignStudentToTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { studentId } = req.body;
        // Check if teacher and student exist
        const teacher = await User_1.User.findById(teacherId);
        const student = await User_1.User.findById(studentId);
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
        const existingAssignment = await StudentTeacher_1.StudentTeacher.findOne({
            studentId,
            teacherId,
        });
        if (existingAssignment) {
            return res
                .status(400)
                .json({ message: "Bu öğrenci zaten bu öğretmene atanmış" });
        }
        // Create new assignment
        await StudentTeacher_1.StudentTeacher.create({
            studentId,
            teacherId,
        });
        res.json({ message: "Öğrenci başarıyla öğretmene atandı" });
    }
    catch (error) {
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
exports.assignStudentToTeacher = assignStudentToTeacher;
const removeStudentFromTeacher = async (req, res) => {
    try {
        const { teacherId, studentId } = req.params;
        const result = await StudentTeacher_1.StudentTeacher.findOneAndDelete({
            studentId,
            teacherId,
        });
        if (!result) {
            return res
                .status(404)
                .json({ message: "Öğrenci-öğretmen ataması bulunamadı" });
        }
        res.json({ message: "Öğrenci öğretmenden kaldırıldı" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.removeStudentFromTeacher = removeStudentFromTeacher;
// Get all teachers for a specific student
const getTeachersForStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const assignments = await StudentTeacher_1.StudentTeacher.find({ studentId })
            .populate("teacherId", "name email")
            .select("teacherId assignedAt");
        const teachers = assignments.map((assignment) => ({
            ...assignment.teacherId.toObject(),
            assignedAt: assignment.assignedAt,
        }));
        res.json(teachers);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.getTeachersForStudent = getTeachersForStudent;
// Get all students for a specific teacher
const getStudentsForTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const assignments = await StudentTeacher_1.StudentTeacher.find({ teacherId })
            .populate("studentId", "name email")
            .select("studentId assignedAt");
        const students = assignments.map((assignment) => ({
            ...assignment.studentId.toObject(),
            assignedAt: assignment.assignedAt,
        }));
        res.json(students);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.getStudentsForTeacher = getStudentsForTeacher;
