import express from "express";
import { auth } from "../middleware/auth";
import checkRole from "../middleware/roleAuth";
import Exam from "../models/Exam";
import Question from "../models/Question";

const router = express.Router();

router.post("/", auth, checkRole("teacher", "admin"), async (req, res) => {
  try {
    const { examId, type, text, options, correctAnswers, difficulty } =
      req.body;
    const question = await Question.create({
      examId,
      type,
      text,
      options,
      correctAnswers,
      difficulty,
    });

    // Sadece examId varsa sınava ekle
    if (examId) {
      await Exam.findByIdAndUpdate(examId, {
        $push: { questions: question._id },
      });
    }

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
});

router.get("/", auth, checkRole("teacher", "admin"), async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
});

router.get("/:id", auth, checkRole("teacher", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Soru bulunamadı" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Bir hata oluştu",
    });
  }
});

router.delete("/:id", auth, checkRole("teacher", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    await Question.findByIdAndDelete(id);
    res.json({ message: "Soru silindi" });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Bir hata oluştu",
    });
  }
});

router.patch("/:id", auth, checkRole("teacher", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Soru bulunamadı" });
    }
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Bir hata oluştu",
    });
  }
});

export default router;
