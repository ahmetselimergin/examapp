"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStudentFromTeacher = exports.assignStudentToTeacher = exports.getAllTeachers = void 0;
const User_1 = require("../models/User");
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
        // Add teacher field to student (we'll need to extend the User model)
        // For now, we'll use a simple approach by adding a teacherId field
        await User_1.User.findByIdAndUpdate(studentId, { teacherId });
        res.json({ message: "Öğrenci başarıyla öğretmene atandı" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.assignStudentToTeacher = assignStudentToTeacher;
const removeStudentFromTeacher = async (req, res) => {
    try {
        const { teacherId, studentId } = req.params;
        const student = await User_1.User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Öğrenci bulunamadı" });
        }
        // Remove teacher assignment
        await User_1.User.findByIdAndUpdate(studentId, { $unset: { teacherId: 1 } });
        res.json({ message: "Öğrenci öğretmenden kaldırıldı" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.removeStudentFromTeacher = removeStudentFromTeacher;
