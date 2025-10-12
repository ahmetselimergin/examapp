import express from 'express';
import { User } from '../models/User';
import Question from '../models/Question';
import Exam from '../models/Exam';
import StudentAnswer from '../models/StudentAnswer';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// Export all data
router.get('/export', auth, adminAuth, async (req, res) => {
  try {
    console.log('📤 Starting data export...');
    
    // Check if passwords should be included (dangerous!)
    const includePasswords = req.query.includePasswords === 'true';
    
    // Fetch all data from collections
    const usersQuery = includePasswords ? 
      User.find({}) : // Include passwords (DANGEROUS!)
      User.find({}).select('-password'); // Exclude passwords for security
    
    const [users, questions, exams, studentAnswers] = await Promise.all([
      usersQuery,
      Question.find({}),
      Exam.find({}).populate('questions').populate('assignedStudents'),
      StudentAnswer.find({})
    ]);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalRecords: {
          users: users.length,
          questions: questions.length,
          exams: exams.length,
          studentAnswers: studentAnswers.length
        }
      },
      data: {
        users,
        questions,
        exams,
        studentAnswers
      }
    };

    console.log(`✅ Export completed: ${JSON.stringify(exportData.metadata.totalRecords)}`);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=examapp-backup-${new Date().toISOString().split('T')[0]}.json`);
    
    res.json(exportData);
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ 
      message: 'Veri dışa aktarma sırasında hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Import data
router.post('/import', auth, adminAuth, async (req, res) => {
  try {
    console.log('📥 Starting data import...');
    
    const { data, options = {} } = req.body;
    const { clearExisting = false, skipExisting = true } = options;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Geçersiz veri formatı' });
    }

    const results = {
      users: { imported: 0, skipped: 0, errors: 0 },
      questions: { imported: 0, skipped: 0, errors: 0 },
      exams: { imported: 0, skipped: 0, errors: 0 },
      studentAnswers: { imported: 0, skipped: 0, errors: 0 }
    };

    // Clear existing data if requested
    if (clearExisting) {
      console.log('🗑️ Clearing existing data...');
      await Promise.all([
        StudentAnswer.deleteMany({}),
        Exam.deleteMany({}),
        Question.deleteMany({}),
        User.deleteMany({ role: { $ne: 'admin' } }) // Keep admin users
      ]);
      console.log('✅ Existing data cleared');
    }

    // Import Users (excluding passwords)
    if (data.users && Array.isArray(data.users)) {
      console.log(`👥 Importing ${data.users.length} users...`);
      for (const userData of data.users) {
        try {
          if (skipExisting) {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
              results.users.skipped++;
              continue;
            }
          }

          // Generate a default password for imported users
          const userToCreate = {
            ...userData,
            password: 'imported123' // Default password for imported users
          };
          
          await User.create(userToCreate);
          results.users.imported++;
        } catch (error) {
          console.error(`Error importing user ${userData.email}:`, error);
          results.users.errors++;
        }
      }
    }

    // Import Questions
    if (data.questions && Array.isArray(data.questions)) {
      console.log(`❓ Importing ${data.questions.length} questions...`);
      for (const questionData of data.questions) {
        try {
          if (skipExisting) {
            const existing = await Question.findOne({ text: questionData.text });
            if (existing) {
              results.questions.skipped++;
              continue;
            }
          }

          await Question.create(questionData);
          results.questions.imported++;
        } catch (error) {
          console.error(`Error importing question:`, error);
          results.questions.errors++;
        }
      }
    }

    // Import Exams
    if (data.exams && Array.isArray(data.exams)) {
      console.log(`📝 Importing ${data.exams.length} exams...`);
      for (const examData of data.exams) {
        try {
          if (skipExisting) {
            const existing = await Exam.findOne({ title: examData.title });
            if (existing) {
              results.exams.skipped++;
              continue;
            }
          }

          // Handle populated fields - extract IDs
          const examToCreate = {
            ...examData,
            questions: examData.questions?.map((q: any) => q._id || q) || [],
            assignedStudents: examData.assignedStudents?.map((s: any) => s._id || s) || []
          };

          await Exam.create(examToCreate);
          results.exams.imported++;
        } catch (error) {
          console.error(`Error importing exam ${examData.title}:`, error);
          results.exams.errors++;
        }
      }
    }

    // Import Student Answers
    if (data.studentAnswers && Array.isArray(data.studentAnswers)) {
      console.log(`📋 Importing ${data.studentAnswers.length} student answers...`);
      for (const answerData of data.studentAnswers) {
        try {
          if (skipExisting) {
            const existing = await StudentAnswer.findOne({ 
              examId: answerData.examId,
              studentId: answerData.studentId,
              questionId: answerData.questionId
            });
            if (existing) {
              results.studentAnswers.skipped++;
              continue;
            }
          }

          await StudentAnswer.create(answerData);
          results.studentAnswers.imported++;
        } catch (error) {
          console.error(`Error importing student answer:`, error);
          results.studentAnswers.errors++;
        }
      }
    }

    console.log('✅ Import completed:', results);

    res.json({
      message: 'Veri içe aktarma tamamlandı',
      results,
      summary: {
        totalImported: Object.values(results).reduce((sum, r) => sum + r.imported, 0),
        totalSkipped: Object.values(results).reduce((sum, r) => sum + r.skipped, 0),
        totalErrors: Object.values(results).reduce((sum, r) => sum + r.errors, 0)
      }
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({ 
      message: 'Veri içe aktarma sırasında hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Get backup info
router.get('/info', auth, adminAuth, async (req, res) => {
  try {
    const [userCount, questionCount, examCount, studentAnswerCount] = await Promise.all([
      User.countDocuments({}),
      Question.countDocuments({}),
      Exam.countDocuments({}),
      StudentAnswer.countDocuments({})
    ]);

    res.json({
      totalRecords: {
        users: userCount,
        questions: questionCount,
        exams: examCount,
        studentAnswers: studentAnswerCount
      },
      lastBackupDate: null // TODO: Store this in a settings collection
    });
  } catch (error) {
    console.error('❌ Backup info error:', error);
    res.status(500).json({ 
      message: 'Yedekleme bilgileri alınamadı',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;
