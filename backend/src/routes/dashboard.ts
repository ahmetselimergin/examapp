import express, { Request, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import Exam from '../models/Exam';
import Question from '../models/Question';
import StudentAnswer from '../models/StudentAnswer';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    let stats = {
      totalExams: 0,
      activeExams: 0,
      totalStudents: 0,
      totalQuestions: 0
    };

    if (userRole === 'admin') {
      // Admin sees all statistics
      stats.totalExams = await Exam.countDocuments();
      stats.activeExams = await Exam.countDocuments({ 
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() }
      });
      stats.totalStudents = await User.countDocuments({ role: 'student' });
      stats.totalQuestions = await Question.countDocuments();
    } else if (userRole === 'teacher') {
      // Teacher sees their own statistics
      stats.totalExams = await Exam.countDocuments({ createdBy: userId });
      stats.activeExams = await Exam.countDocuments({ 
        createdBy: userId,
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() }
      });
      stats.totalStudents = await User.countDocuments({ role: 'student' });
      stats.totalQuestions = await Question.countDocuments({ createdBy: userId });
    } else if (userRole === 'student') {
      // Student sees assigned exams
      const assignedExams = await Exam.find({ 
        assignedStudents: userId 
      });
      stats.totalExams = assignedExams.length;
      stats.activeExams = assignedExams.filter((exam: any) => 
        exam.startTime <= new Date() && exam.endTime >= new Date()
      ).length;
      stats.totalStudents = 0; // Students don't see student count
      stats.totalQuestions = 0; // Students don't see question count
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/activity', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const activities: any[] = [];

    if (userRole === 'admin') {
      // Recent exams created
      const recentExams = await Exam.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name email');

      recentExams.forEach((exam: any) => {
        activities.push({
          id: `exam-${exam._id}`,
          type: 'exam',
          icon: 'quiz',
          title: 'New exam created',
          description: `${exam.title} by ${exam.createdBy?.name || exam.createdBy?.email}`,
          timestamp: exam.createdAt
        });
      });

      // Recent students registered
      const recentStudents = await User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(3);

      recentStudents.forEach((student: any) => {
        activities.push({
          id: `student-${student._id}`,
          type: 'student',
          icon: 'person_add',
          title: 'New student registered',
          description: `${student.name || student.email} joined the system`,
          timestamp: student.createdAt
        });
      });

    } else if (userRole === 'teacher') {
      // Teacher's recent exams
      const recentExams = await Exam.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5);

      recentExams.forEach((exam: any) => {
        activities.push({
          id: `exam-${exam._id}`,
          type: 'exam',
          icon: 'quiz',
          title: 'Exam created',
          description: exam.title,
          timestamp: exam.createdAt
        });
      });

      // Recent questions created
      const recentQuestions = await Question.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(3);

      recentQuestions.forEach((question: any) => {
        activities.push({
          id: `question-${question._id}`,
          type: 'question',
          icon: 'help',
          title: 'Question added',
          description: question.text.substring(0, 50) + '...',
          timestamp: question.createdAt
        });
      });

    } else if (userRole === 'student') {
      // Student's recent exam attempts
      const recentAnswers = await StudentAnswer.find({ student: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('exam', 'title');

      recentAnswers.forEach((answer: any) => {
        activities.push({
          id: `answer-${answer._id}`,
          type: 'exam',
          icon: 'assignment_turned_in',
          title: 'Exam completed',
          description: answer.exam?.title || 'Unknown exam',
          timestamp: answer.createdAt
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(activities.slice(0, 10)); // Return top 10 activities
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
