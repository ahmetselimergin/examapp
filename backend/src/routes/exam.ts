// backend/src/routes/exams.js
import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import checkRole from "../middleware/roleAuth";
import Exam from "../models/Exam";
import Question from "../models/Question";
import StudentAnswer from "../models/StudentAnswer";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

// Get all exams
router.get("/", auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const exams = await Exam.find()
      .populate("createdBy", "name email")
      .populate("assignedStudents", "name email")
      .populate("questions", "text type difficulty")
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
});

// Get single exam
router.get(
  "/:id",
  auth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exam = await Exam.findById(req.params.id)
        .populate("createdBy", "name")
        .populate("questions")
        .populate("assignedStudents", "name email");

      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      // Eğer öğrenci ve sınav başlamadıysa erişimi engelle
      if (
        req.user?.role === "student" &&
        new Date() < new Date(exam.startTime)
      ) {
        res.status(403).json({ message: "Sınav henüz başlamadı." });
        return;
      }

      res.json(exam);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Create new exam (only teachers and admins)
router.post(
  "/",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        title,
        description,
        startTime,
        endTime,
        duration,
        questionCount,
      } = req.body;

      console.log("Create exam - User:", req.user);
      console.log("Create exam - User _id:", req.user?._id);

      const exam = await Exam.create({
        title,
        description,
        startTime,
        endTime,
        duration,
        questionCount: questionCount || 0,
        createdBy: req.user?._id,
        questions: [],
        assignedStudents: [],
      });

      console.log("Created exam:", exam);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Create exam error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Add existing questions to exam
router.post(
  "/:id/add-questions",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { questionIds } = req.body;
      const exam = await Exam.findById(req.params.id);

      console.log("Add questions - User:", req.user);
      console.log("Add questions - Exam:", exam);

      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      console.log("Exam createdBy:", exam.createdBy.toString());
      console.log("User _id:", req.user?._id);
      console.log("User role:", req.user?.role);

      // Convert both to strings for comparison
      const examCreatorId = exam.createdBy.toString();
      const userId = req.user?._id?.toString();

      console.log("Exam creator ID (string):", examCreatorId);
      console.log("User ID (string):", userId);
      console.log("Are they equal?", examCreatorId === userId);

      if (examCreatorId !== userId && req.user?.role !== "admin") {
        console.log("Permission denied - not creator and not admin");
        res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
        return;
      }

      // Verify questions exist
      const questions = await Question.find({ _id: { $in: questionIds } });
      if (questions.length !== questionIds.length) {
        res.status(400).json({ message: "Bazı sorular bulunamadı" });
        return;
      }

      // Add questions to exam
      exam.questions = [...new Set([...exam.questions, ...questionIds])];
      await exam.save();

      const updatedExam = await Exam.findById(req.params.id)
        .populate("createdBy", "name")
        .populate("questions")
        .populate("assignedStudents", "name email");

      res.json(updatedExam);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Update exam (only creator, teachers and admins)
router.put(
  "/:id",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      if (
        exam.createdBy.toString() !== req.user?._id?.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
        return;
      }

      const updatedExam = await Exam.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      ).populate("createdBy", "name");

      res.json(updatedExam);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Assign students to exam
router.post(
  "/:id/assign-students",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { studentIds } = req.body;
      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      if (
        exam.createdBy.toString() !== req.user?._id?.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
        return;
      }

      exam.assignedStudents = studentIds;
      await exam.save();

      const updatedExam = await Exam.findById(req.params.id)
        .populate("createdBy", "name")
        .populate("assignedStudents", "name email");

      res.json(updatedExam);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Sınavı bitir (admin/teacher)
router.post(
  "/:id/finish",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }
      exam.isFinished = true;
      await exam.save();
      res.json({ message: "Sınav başarıyla sonlandırıldı", exam });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    }
  }
);

// Delete exam (only creator and admins)
router.delete(
  "/:id",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      if (
        exam.createdBy.toString() !== req.user?._id?.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({ message: "Bu sınavı silme yetkiniz yok" });
        return;
      }

      await exam.deleteOne();
      res.json({ message: "Sınav başarıyla silindi" });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
);

// Öğrenci cevaplarını kaydet
router.post(
  "/:id/submit-answers",
  auth,
  checkRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { answers } = req.body; // [{ questionId, response }]
      const examId = req.params.id;
      const studentId = req.user?._id;

      // Sınavın var olduğunu ve öğrencinin atanmış olduğunu kontrol et
      const exam = await Exam.findById(examId);
      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      if (
        !studentId ||
        !exam.assignedStudents
          .map((id) => id.toString())
          .includes(studentId.toString())
      ) {
        res.status(403).json({ message: "Bu sınavı alma yetkiniz yok" });
        return;
      }

      // Cevapları kaydet
      const answerPromises = answers.map((answer: any) => {
        return StudentAnswer.findOneAndUpdate(
          { examId, studentId, questionId: answer.questionId },
          { response: answer.response },
          { upsert: true, new: true }
        );
      });

      await Promise.all(answerPromises);

      res.json({ message: "Cevaplar başarıyla kaydedildi" });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Cevaplar kaydedilemedi",
      });
    }
  }
);

// Öğrencinin cevaplarını getir (öğretmen/admin için)
router.get(
  "/:id/answers/:studentId",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id: examId, studentId } = req.params;

      // Sınavın var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
      const exam = await Exam.findById(examId);
      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      if (
        exam.createdBy.toString() !== req.user?._id?.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({ message: "Bu sınavı görme yetkiniz yok" });
        return;
      }

      // Öğrencinin cevaplarını getir
      const answers = await StudentAnswer.find({ examId, studentId })
        .populate("questionId", "text type options correctAnswers")
        .sort("questionId");

      // Cevapları frontend'in beklediği formata dönüştür
      const formattedAnswers = answers.map((answer) => {
        const q = answer.questionId as any;
        return {
          questionId: q._id || q,
          questionText: q && typeof q === "object" && "text" in q ? q.text : "",
          response: answer.response,
          score: answer.score || 0,
        };
      });

      res.json({ answers: formattedAnswers });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Cevaplar yüklenemedi",
      });
    }
  }
);

// Öğrenci cevaplarının puanlarını kaydet
router.post(
  "/:id/answers/:studentId/score",
  auth,
  checkRole("teacher", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id: examId, studentId } = req.params;
      const { scores } = req.body; // [{ questionId, score }]

      // Sınavın var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
      const exam = await Exam.findById(examId);
      if (!exam) {
        res.status(404).json({ message: "Sınav bulunamadı" });
        return;
      }

      if (
        exam.createdBy.toString() !== req.user?._id?.toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({ message: "Bu sınavı düzenleme yetkiniz yok" });
        return;
      }

      // Puanları kaydet
      const scorePromises = scores.map((scoreData: any) => {
        return StudentAnswer.findOneAndUpdate(
          { examId, studentId, questionId: scoreData.questionId },
          { score: scoreData.score },
          { new: true }
        );
      });

      await Promise.all(scorePromises);

      res.json({ message: "Puanlar başarıyla kaydedildi" });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Puanlar kaydedilemedi",
      });
    }
  }
);

export default router;
