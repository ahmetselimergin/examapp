"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controllers/studentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Tüm öğrencileri getir
router.get("/", auth_1.auth, studentController_1.getAllStudents);
// Öğrenci detayını getir
router.get("/:id", auth_1.auth, studentController_1.getStudentById);
// Yeni öğrenci oluştur
router.post("/", auth_1.auth, studentController_1.createStudent);
// Öğrenci bilgilerini güncelle
router.put("/:id", auth_1.auth, studentController_1.updateStudent);
// Öğrenci sil
router.delete("/:id", auth_1.auth, studentController_1.deleteStudent);
// Öğrencilere öğretmen ata
router.post("/assign-teacher", auth_1.auth, studentController_1.assignTeacherToStudents);
exports.default = router;
