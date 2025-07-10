"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/exams.js
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = __importDefault(require("../middleware/roleAuth"));
const Exam_1 = __importDefault(require("../models/Exam"));
const Question_1 = __importDefault(require("../models/Question"));
const StudentAnswer_1 = __importDefault(require("../models/StudentAnswer"));
const router = express_1.default.Router();
// Get all exams
router.get("/", auth_1.auth, async (req, res) => {
    try {
        const exams = await Exam_1.default.find()
            .populate("createdBy", "name")
            .populate("assignedStudents", "name email");
        res.json(exams);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Get single exam
router.get("/:id", auth_1.auth, async (req, res) => {
    var _a;
    try {
        const exam = await Exam_1.default.findById(req.params.id)
            .populate("createdBy", "name")
            .populate("questions")
            .populate("assignedStudents", "name email");
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        // Eğer öğrenci ve sınav başlamadıysa erişimi engelle
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "student" &&
            new Date() < new Date(exam.startTime)) {
            res.status(403).json({ message: "Sınav henüz başlamadı." });
            return;
        }
        res.json(exam);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Create new exam (only teachers and admins)
router.post("/", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a;
    try {
        const { title, description, startTime, endTime, duration } = req.body;
        const exam = await Exam_1.default.create({
            title,
            description,
            startTime,
            endTime,
            duration,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            questions: [],
            assignedStudents: [],
        });
        res.status(201).json(exam);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Add existing questions to exam
router.post("/:id/add-questions", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b;
    try {
        const { questionIds } = req.body;
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (exam.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
            return;
        }
        // Verify questions exist
        const questions = await Question_1.default.find({ _id: { $in: questionIds } });
        if (questions.length !== questionIds.length) {
            res.status(400).json({ message: "Bazı sorular bulunamadı" });
            return;
        }
        // Add questions to exam
        exam.questions = [...new Set([...exam.questions, ...questionIds])];
        await exam.save();
        const updatedExam = await Exam_1.default.findById(req.params.id)
            .populate("createdBy", "name")
            .populate("questions")
            .populate("assignedStudents", "name email");
        res.json(updatedExam);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Update exam (only creator, teachers and admins)
router.put("/:id", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b;
    try {
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (exam.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
            return;
        }
        const updatedExam = await Exam_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("createdBy", "name");
        res.json(updatedExam);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Assign students to exam
router.post("/:id/assign-students", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b;
    try {
        const { studentIds } = req.body;
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (exam.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
            return;
        }
        exam.assignedStudents = studentIds;
        await exam.save();
        const updatedExam = await Exam_1.default.findById(req.params.id)
            .populate("createdBy", "name")
            .populate("assignedStudents", "name email");
        res.json(updatedExam);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Sınavı bitir (admin/teacher)
router.post("/:id/finish", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    try {
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        exam.isFinished = true;
        await exam.save();
        res.json({ message: "Sınav başarıyla sonlandırıldı", exam });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Bir hata oluştu",
        });
    }
});
// Delete exam (only creator and admins)
router.delete("/:id", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b;
    try {
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (exam.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ message: "Bu sınavı silme yetkiniz yok" });
            return;
        }
        await exam.deleteOne();
        res.json({ message: "Sınav başarıyla silindi" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Öğrenci cevaplarını kaydet
router.post("/:id/submit-answers", auth_1.auth, (0, roleAuth_1.default)("student"), async (req, res) => {
    var _a;
    try {
        const { answers } = req.body; // [{ questionId, response }]
        const examId = req.params.id;
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Sınavın var olduğunu ve öğrencinin atanmış olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (!studentId ||
            !exam.assignedStudents
                .map((id) => id.toString())
                .includes(studentId.toString())) {
            res.status(403).json({ message: "Bu sınavı alma yetkiniz yok" });
            return;
        }
        // Cevapları kaydet
        const answerPromises = answers.map((answer) => {
            return StudentAnswer_1.default.findOneAndUpdate({ examId, studentId, questionId: answer.questionId }, { response: answer.response }, { upsert: true, new: true });
        });
        await Promise.all(answerPromises);
        res.json({ message: "Cevaplar başarıyla kaydedildi" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Cevaplar kaydedilemedi",
        });
    }
});
// Öğrencinin cevaplarını getir (öğretmen/admin için)
router.get("/:id/answers/:studentId", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b;
    try {
        const { id: examId, studentId } = req.params;
        // Sınavın var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (exam.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ message: "Bu sınavı görme yetkiniz yok" });
            return;
        }
        // Öğrencinin cevaplarını getir
        const answers = await StudentAnswer_1.default.find({ examId, studentId })
            .populate("questionId", "text type options correctAnswers")
            .sort("questionId");
        // Cevapları frontend'in beklediği formata dönüştür
        const formattedAnswers = answers.map((answer) => {
            const q = answer.questionId;
            return {
                questionId: q._id || q,
                questionText: q && typeof q === "object" && "text" in q ? q.text : "",
                response: answer.response,
                score: answer.score || 0,
            };
        });
        res.json({ answers: formattedAnswers });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Cevaplar yüklenemedi",
        });
    }
});
// Öğrenci cevaplarının puanlarını kaydet
router.post("/:id/answers/:studentId/score", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b;
    try {
        const { id: examId, studentId } = req.params;
        const { scores } = req.body; // [{ questionId, score }]
        // Sınavın var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Sınav bulunamadı" });
            return;
        }
        if (exam.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin") {
            res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
            return;
        }
        // Puanları kaydet
        const scorePromises = scores.map((scoreData) => {
            return StudentAnswer_1.default.findOneAndUpdate({ examId, studentId, questionId: scoreData.questionId }, { score: scoreData.score }, { new: true });
        });
        await Promise.all(scorePromises);
        res.json({ message: "Puanlar başarıyla kaydedildi" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Puanlar kaydedilemedi",
        });
    }
});
exports.default = router;
