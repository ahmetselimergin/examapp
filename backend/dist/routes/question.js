"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = __importDefault(require("../middleware/roleAuth"));
const Exam_1 = __importDefault(require("../models/Exam"));
const Question_1 = __importDefault(require("../models/Question"));
const router = express_1.default.Router();
router.post("/", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    try {
        const { examId, type, text, options, correctAnswers, difficulty } = req.body;
        const question = await Question_1.default.create({
            examId,
            type,
            text,
            options,
            correctAnswers,
            difficulty,
        });
        // Sadece examId varsa sınava ekle
        if (examId) {
            await Exam_1.default.findByIdAndUpdate(examId, {
                $push: { questions: question._id },
            });
        }
        res.status(201).json(question);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
router.get("/", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    try {
        const questions = await Question_1.default.find();
        res.json(questions);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
router.get("/:id", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question_1.default.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Soru bulunamadı" });
        }
        res.json(question);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Bir hata oluştu",
        });
    }
});
router.delete("/:id", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    try {
        const { id } = req.params;
        await Question_1.default.findByIdAndDelete(id);
        res.json({ message: "Soru silindi" });
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Bir hata oluştu",
        });
    }
});
router.patch("/:id", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await Question_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!updatedQuestion) {
            return res.status(404).json({ message: "Soru bulunamadı" });
        }
        res.json(updatedQuestion);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Bir hata oluştu",
        });
    }
});
exports.default = router;
