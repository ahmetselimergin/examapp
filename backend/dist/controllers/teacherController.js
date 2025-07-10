"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStudentFromTeacher = exports.assignStudentToTeacher = exports.getAllTeachers = void 0;
const Teacher_1 = __importDefault(require("../models/Teacher"));
const Student_1 = __importDefault(require("../models/Student"));
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
        const teacher = await Teacher_1.default.findById(teacherId);
        const student = await Student_1.default.findById(studentId);
        if (!teacher || !student) {
            res.status(404).json({ message: "Öğretmen veya öğrenci bulunamadı" });
            return;
        }
        if (!teacher.students.includes(studentId)) {
            teacher.students.push(studentId);
            await teacher.save();
        }
        res.json(teacher);
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
        const teacher = await Teacher_1.default.findById(teacherId);
        if (!teacher) {
            res.status(404).json({ message: "Öğretmen bulunamadı" });
            return;
        }
        teacher.students = teacher.students.filter((id) => id.toString() !== studentId);
        await teacher.save();
        res.json(teacher);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.removeStudentFromTeacher = removeStudentFromTeacher;
