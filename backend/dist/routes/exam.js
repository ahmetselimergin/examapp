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
const ExamAttempt_1 = __importDefault(require("../models/ExamAttempt"));
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// Get all exams
router.get("/", auth_1.auth, async (req, res) => {
    var _a;
    try {
        let query = {};
        // If user is a student, only show exams assigned to them
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'student') {
            query = { assignedStudents: { $in: [req.user._id] } };
        }
        const exams = await Exam_1.default.find(query)
            .populate("createdBy", "name email")
            .populate("assignedStudents", "name email")
            .populate("questions.questionId", "text type difficulty")
            .sort({ createdAt: -1 });
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
            .populate("questions.questionId")
            .populate("assignedStudents", "name email");
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        // If user is a student, check if they are assigned to this exam
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "student") {
            const isAssigned = exam.assignedStudents.some((student) => { var _a; return student._id.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()); });
            if (!isAssigned) {
                res.status(403).json({ message: "You are not assigned to this exam" });
                return;
            }
            // Check if exam has started
            if (new Date() < new Date(exam.startTime)) {
                res.status(403).json({ message: "Exam has not started yet" });
                return;
            }
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
        const { title, description, startTime, endTime, duration, questionCount, attemptLimit, } = req.body;
        const exam = await Exam_1.default.create({
            title,
            description,
            startTime,
            endTime,
            duration,
            questionCount: questionCount || 0,
            attemptLimit: attemptLimit || 1,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            questions: [],
            assignedStudents: [],
        });
        res.status(201).json(exam);
    }
    catch (error) {
        console.error("Create exam error:", error);
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Add existing questions to exam
router.post("/:id/add-questions", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b, _c;
    try {
        const { questionsWithPoints } = req.body;
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        // Convert both to strings for comparison
        const examCreatorId = exam.createdBy.toString();
        const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
        if (examCreatorId !== userId && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
            res.status(403).json({ message: "You don't have permission to edit this exam" });
            return;
        }
        // Extract question IDs for verification
        const questionIds = questionsWithPoints.map((q) => q.questionId);
        // Verify questions exist
        const questions = await Question_1.default.find({ _id: { $in: questionIds } });
        if (questions.length !== questionIds.length) {
            res.status(400).json({ message: "Some questions not found" });
            return;
        }
        // Add questions with points to exam
        exam.questions = questionsWithPoints.map((q) => ({
            questionId: q.questionId,
            points: q.points
        }));
        await exam.save();
        const updatedExam = await Exam_1.default.findById(req.params.id)
            .populate("createdBy", "name")
            .populate("questions.questionId")
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
    var _a, _b, _c;
    try {
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (exam.createdBy.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
            res.status(403).json({ message: "You don't have permission to edit this exam" });
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
    var _a, _b, _c;
    try {
        const { studentIds } = req.body;
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (exam.createdBy.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
            res.status(403).json({ message: "You don't have permission to edit this exam" });
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
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        exam.isFinished = true;
        await exam.save();
        res.json({ message: "Exam finished successfully", exam });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Check if student can attempt exam
router.get("/:id/check-attempts", auth_1.auth, async (req, res) => {
    var _a, _b;
    try {
        const examId = req.params.id;
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'student') {
            res.status(403).json({ message: "Only students can check attempts" });
            return;
        }
        // Get exam details
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        // Check if student is assigned to this exam
        const isAssigned = exam.assignedStudents.some((student) => student._id ? student._id.toString() === (studentId === null || studentId === void 0 ? void 0 : studentId.toString()) : student.toString() === (studentId === null || studentId === void 0 ? void 0 : studentId.toString()));
        if (!isAssigned) {
            res.status(403).json({ message: "You are not assigned to this exam" });
            return;
        }
        // Count existing attempts
        const existingAttempts = await ExamAttempt_1.default.countDocuments({
            examId: examId,
            studentId: studentId
        });
        const canAttempt = existingAttempts < exam.attemptLimit;
        res.json({
            canAttempt,
            attemptsUsed: existingAttempts,
            attemptsLimit: exam.attemptLimit,
            examTitle: exam.title
        });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
// Start exam attempt (students only) 
router.post("/:id/start", auth_1.auth, (0, roleAuth_1.default)("student"), async (req, res) => {
    var _a;
    try {
        const examId = req.params.id;
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Sınavın var olduğunu ve öğrencinin atanmış olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (!studentId ||
            !exam.assignedStudents
                .map((id) => id.toString())
                .includes(studentId.toString())) {
            res.status(403).json({ message: "You don't have permission to take this exam" });
            return;
        }
        // Sınav zamanı kontrolü
        const now = new Date();
        if (now < new Date(exam.startTime)) {
            res.status(403).json({ message: "Exam has not started yet" });
            return;
        }
        if (now > new Date(exam.endTime)) {
            res.status(403).json({ message: "Exam time has expired" });
            return;
        }
        // Mevcut attempt sayısını kontrol et
        const existingAttempts = await ExamAttempt_1.default.countDocuments({
            examId: examId,
            studentId: studentId,
        });
        if (existingAttempts >= exam.attemptLimit) {
            res.status(403).json({
                message: `You can take this exam maximum ${exam.attemptLimit} times. Your attempt limit has been exceeded.`
            });
            return;
        }
        // Yeni attempt başlat
        const newAttemptNumber = existingAttempts + 1;
        const attempt = await ExamAttempt_1.default.create({
            examId: examId,
            studentId: studentId,
            attemptNumber: newAttemptNumber,
        });
        res.json({
            message: "Exam started successfully",
            attemptNumber: newAttemptNumber,
            attemptId: attempt._id,
            remainingAttempts: exam.attemptLimit - newAttemptNumber
        });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Could not start exam",
        });
    }
});
// Delete exam (only creator and admins)
router.delete("/:id", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b, _c;
    try {
        const exam = await Exam_1.default.findById(req.params.id);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (exam.createdBy.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
            res.status(403).json({ message: "You don't have permission to delete this exam" });
            return;
        }
        await exam.deleteOne();
        res.json({ message: "Exam deleted successfully" });
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
        const { answers, attemptId } = req.body; // [{ questionId, response }], attemptId
        const examId = req.params.id;
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Sınavın var olduğunu ve öğrencinin atanmış olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (!studentId ||
            !exam.assignedStudents
                .map((id) => id.toString())
                .includes(studentId.toString())) {
            res.status(403).json({ message: "You don't have permission to take this exam" });
            return;
        }
        // Attempt'i bul ve attemptNumber'ı al
        const attempt = await ExamAttempt_1.default.findById(attemptId);
        if (!attempt) {
            res.status(400).json({ message: "Exam session not found" });
            return;
        }
        if (attempt.studentId.toString() !== studentId.toString()) {
            res.status(403).json({ message: "This exam session does not belong to you" });
            return;
        }
        // Cevapları kaydet
        const answerPromises = answers.map((answer) => {
            return StudentAnswer_1.default.findOneAndUpdate({ examId, studentId, questionId: answer.questionId, attemptNumber: attempt.attemptNumber }, { response: answer.response }, { upsert: true, new: true });
        });
        await Promise.all(answerPromises);
        // Attempt'ı tamamlandı olarak işaretle
        attempt.isCompleted = true;
        attempt.completedAt = new Date();
        await attempt.save();
        res.json({ message: "Answers saved successfully" });
    }
    catch (error) {
        console.error('Submit answers error:', error);
        res.status(400).json({
            message: error instanceof Error ? error.message : "Could not save answers",
        });
    }
});
// Öğrencinin cevaplarını getir (öğretmen/admin için)
router.get("/:id/answers/:studentId", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b, _c;
    try {
        const { id: examId, studentId } = req.params;
        // Sınavın var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (exam.createdBy.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
            res.status(403).json({ message: "You don't have permission to view this exam" });
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
            message: error instanceof Error ? error.message : "Could not load answers",
        });
    }
});
// Öğrenci cevaplarının puanlarını kaydet
router.post("/:id/answers/:studentId/score", auth_1.auth, (0, roleAuth_1.default)("teacher", "admin"), async (req, res) => {
    var _a, _b, _c;
    try {
        const { id: examId, studentId } = req.params;
        const { scores } = req.body; // [{ questionId, score }]
        // Sınavın var olduğunu ve kullanıcının yetkisi olduğunu kontrol et
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        if (exam.createdBy.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
            res.status(403).json({ message: "You don't have permission to edit this exam" });
            return;
        }
        // Puanları kaydet
        const scorePromises = scores.map((scoreData) => {
            return StudentAnswer_1.default.findOneAndUpdate({ examId, studentId, questionId: scoreData.questionId }, { score: scoreData.score }, { new: true });
        });
        await Promise.all(scorePromises);
        res.json({ message: "Scores saved successfully" });
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Could not save scores",
        });
    }
});
// Manually finish exam (for teachers/admins)
router.patch("/:id/finish", auth_1.auth, async (req, res) => {
    var _a;
    try {
        const examId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Check if user has required role
        if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const exam = await Exam_1.default.findById(examId);
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        // Check if user has permission to finish this exam
        if (req.user.role !== "admin" && exam.createdBy.toString() !== userId.toString()) {
            res.status(403).json({ message: "You don't have permission to finish this exam" });
            return;
        }
        // Update exam to finished status
        await Exam_1.default.findByIdAndUpdate(examId, {
            isFinished: true,
            finishedAt: new Date()
        });
        res.json({ message: "Exam finished successfully" });
    }
    catch (error) {
        console.error("Finish exam error:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to finish exam",
        });
    }
});
// Get exam results
router.get("/:id/results", auth_1.auth, async (req, res) => {
    var _a;
    try {
        const examId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Check if user has required role
        if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const exam = await Exam_1.default.findById(examId)
            .populate("createdBy", "name")
            .populate("questions.questionId");
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        // Check if user has permission to view results
        const createdBy = exam.createdBy;
        if (req.user.role !== "admin" && createdBy._id.toString() !== userId.toString()) {
            res.status(403).json({ message: "You don't have permission to view these results" });
            return;
        }
        // Get only the latest attempt for each student
        const attempts = await ExamAttempt_1.default.aggregate([
            { $match: { examId: new mongoose_1.default.Types.ObjectId(examId) } },
            { $sort: { attemptNumber: -1 } }, // Sort by attempt number descending
            {
                $group: {
                    _id: "$studentId", // Group by student
                    latestAttempt: { $first: "$$ROOT" } // Take the first (latest) attempt
                }
            },
            {
                $replaceRoot: { newRoot: "$latestAttempt" }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            {
                $unwind: "$studentInfo"
            },
            {
                $sort: { "studentInfo.name": 1 } // Sort by student name
            }
        ]);
        const results = [];
        for (const attempt of attempts) {
            // Get all answers for this attempt
            const studentAnswers = await StudentAnswer_1.default.find({
                examId,
                studentId: attempt.studentId,
                attemptNumber: attempt.attemptNumber
            }).populate("questionId");
            // Calculate score based on predefined question points
            let totalScore = 0;
            let totalQuestions = exam.questions.length;
            for (const answer of studentAnswers) {
                const question = await Question_1.default.findById(answer.questionId);
                if (!question)
                    continue;
                // Find the points for this question from exam.questions
                const examQuestion = exam.questions.find((q) => q.questionId._id.toString() === answer.questionId.toString());
                if (!examQuestion)
                    continue;
                // Only auto-score non-open-ended questions
                if (question.type !== 'open_ended') {
                    let isCorrect = false;
                    if (question.type === 'multiple_select') {
                        // For multiple select, check if arrays match
                        const correctAnswers = Array.isArray(question.correctAnswers) ? question.correctAnswers.sort() : [];
                        const userAnswers = Array.isArray(answer.response) ? answer.response.sort() : [];
                        isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
                    }
                    else {
                        // For single choice, true/false
                        isCorrect = question.correctAnswers === answer.response;
                    }
                    if (isCorrect) {
                        totalScore += examQuestion.points;
                    }
                }
                else {
                    // For open-ended questions, use manually assigned score
                    totalScore += answer.score || 0;
                }
            }
            const finalScore = Math.round(totalScore);
            results.push({
                _id: attempt._id,
                student: {
                    _id: attempt.studentInfo._id,
                    name: attempt.studentInfo.name,
                    email: attempt.studentInfo.email
                },
                attemptNumber: attempt.attemptNumber,
                score: finalScore,
                totalQuestions,
                status: attempt.isCompleted ? 'completed' : 'in_progress',
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt,
                answeredQuestions: studentAnswers.length
            });
        }
        res.json(results);
    }
    catch (error) {
        console.error("Get exam results error:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to get exam results",
        });
    }
});
// Get student answers for manual scoring
router.get("/:examId/student/:studentId/answers", auth_1.auth, async (req, res) => {
    try {
        const { examId, studentId } = req.params;
        const { attemptNumber = 1 } = req.query;
        // Check if user has required role
        if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        // Get exam with questions
        const exam = await Exam_1.default.findById(examId).populate({
            path: 'questions.questionId',
            model: 'Question'
        });
        if (!exam) {
            res.status(404).json({ message: "Exam not found" });
            return;
        }
        // Get student info
        const student = await User_1.User.findById(studentId).select('name email');
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Get student answers for this attempt
        const studentAnswers = await StudentAnswer_1.default.find({
            examId,
            studentId,
            attemptNumber: parseInt(attemptNumber)
        });
        // Create answers map for quick lookup
        const answersMap = new Map();
        studentAnswers.forEach(answer => {
            answersMap.set(answer.questionId.toString(), {
                response: answer.response,
                score: answer.score || 0
            });
        });
        // Format response with questions and answers
        const questionsWithAnswers = exam.questions.map((examQuestion) => {
            const question = examQuestion.questionId;
            const questionId = question._id.toString();
            const studentAnswer = answersMap.get(questionId);
            return {
                _id: question._id,
                text: question.text,
                type: question.type,
                options: question.options || [],
                correctAnswers: question.correctAnswers,
                difficulty: question.difficulty,
                studentAnswer: (studentAnswer === null || studentAnswer === void 0 ? void 0 : studentAnswer.response) || null,
                score: (studentAnswer === null || studentAnswer === void 0 ? void 0 : studentAnswer.score) || 0,
                maxScore: examQuestion.points,
                isManualScoring: question.type === 'open_ended' // Only open-ended questions can be manually scored
            };
        });
        res.json({
            student: {
                _id: student._id,
                name: student.name,
                email: student.email
            },
            exam: {
                _id: exam._id,
                title: exam.title
            },
            attemptNumber: parseInt(attemptNumber),
            questions: questionsWithAnswers,
            totalMaxScore: exam.questions.reduce((sum, q) => sum + q.points, 0)
        });
    }
    catch (error) {
        console.error("Get student answers error:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to get student answers",
        });
    }
});
// Save manual scores for student answers
router.post("/:examId/student/:studentId/scores", auth_1.auth, async (req, res) => {
    try {
        const { examId, studentId } = req.params;
        const { scores, attemptNumber = 1 } = req.body; // scores: [{ questionId, score }]
        // Check if user has required role
        if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        // Update scores for each question
        const updatePromises = scores.map(async (scoreData) => {
            return StudentAnswer_1.default.findOneAndUpdate({
                examId,
                studentId,
                questionId: scoreData.questionId,
                attemptNumber: parseInt(attemptNumber)
            }, { score: scoreData.score }, { upsert: false, new: true });
        });
        await Promise.all(updatePromises);
        res.json({ message: "Scores saved successfully" });
    }
    catch (error) {
        console.error("Save scores error:", error);
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to save scores",
        });
    }
});
exports.default = router;
