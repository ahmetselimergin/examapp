"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teacherController_1 = require("../controllers/teacherController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Tüm öğretmenleri getir
router.get("/", auth_1.auth, teacherController_1.getAllTeachers);
// Bir öğrencinin tüm öğretmenlerini getir (specific route first)
router.get("/student/:studentId/teachers", auth_1.auth, teacherController_1.getTeachersForStudent);
// Bir öğretmenin tüm öğrencilerini getir (generic route after specific)
router.get("/:teacherId/students", auth_1.auth, teacherController_1.getStudentsForTeacher);
// Öğrenciyi öğretmene ata
router.post("/:teacherId/students", auth_1.auth, teacherController_1.assignStudentToTeacher);
// Öğrenciyi öğretmenden kaldır
router.delete("/:teacherId/students/:studentId", auth_1.auth, teacherController_1.removeStudentFromTeacher);
exports.default = router;
