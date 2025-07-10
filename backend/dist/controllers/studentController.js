"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTeacherToStudents = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const Student_1 = __importDefault(require("../models/Student"));
// Tüm öğrencileri getir
const getAllStudents = async (req, res) => {
    try {
        const students = await Student_1.default.find().populate("teacher");
        res.json(students);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Öğrenciler getirilirken bir hata oluştu" });
    }
};
exports.getAllStudents = getAllStudents;
// Öğrenci detayını getir
const getStudentById = async (req, res) => {
    try {
        const student = await Student_1.default.findById(req.params.id).populate("teacher");
        if (!student) {
            res.status(404).json({ message: "Öğrenci bulunamadı" });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: "Öğrenci getirilirken bir hata oluştu" });
    }
};
exports.getStudentById = getStudentById;
// Yeni öğrenci oluştur
const createStudent = async (req, res) => {
    try {
        const student = new Student_1.default(req.body);
        await student.save();
        res.status(201).json(student);
    }
    catch (error) {
        res.status(400).json({ message: "Öğrenci oluşturulurken bir hata oluştu" });
    }
};
exports.createStudent = createStudent;
// Öğrenci bilgilerini güncelle
const updateStudent = async (req, res) => {
    try {
        const student = await Student_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!student) {
            res.status(404).json({ message: "Öğrenci bulunamadı" });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(400).json({ message: "Öğrenci güncellenirken bir hata oluştu" });
    }
};
exports.updateStudent = updateStudent;
// Öğrenci sil
const deleteStudent = async (req, res) => {
    try {
        const student = await Student_1.default.findByIdAndDelete(req.params.id);
        if (!student) {
            res.status(404).json({ message: "Öğrenci bulunamadı" });
            return;
        }
        res.json({ message: "Öğrenci başarıyla silindi" });
    }
    catch (error) {
        res.status(500).json({ message: "Öğrenci silinirken bir hata oluştu" });
    }
};
exports.deleteStudent = deleteStudent;
// Öğrencilere öğretmen ata
const assignTeacherToStudents = async (req, res) => {
    try {
        const { studentIds, teacherId } = req.body; // studentIds: string[], teacherId: string
        await Student_1.default.updateMany({ _id: { $in: studentIds } }, { $set: { teacher: teacherId } });
        res.json({ message: "Öğretmen ataması başarılı" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
};
exports.assignTeacherToStudents = assignTeacherToStudents;
