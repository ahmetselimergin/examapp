<template>
  <div class="exam-results-container">
    <h1>Sınav Sonuçları</h1>
    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <h2>{{ exam.title }}</h2>
      <p class="description">{{ exam.description }}</p>
      <h3>Öğrenciler</h3>
      <div v-if="exam.assignedStudents && exam.assignedStudents.length">
        <table class="students-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Durum / Toplam Puan</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in exam.assignedStudents" :key="student._id">
              <td>{{ student.name }}</td>
              <td>{{ student.email }}</td>
              <td>
                <template v-if="studentScores[student._id] !== undefined && studentScores[student._id] !== '-'">
                  <span class="score-badge">{{ studentScores[student._id] }}</span>
                </template>
                <template v-else>
                  <span class="not-finished-badge">Tamamlamadı</span>
                </template>
              </td>
              <td>
                <Button 
                  type="button"
                  styleType="primary"
                  size="small"
                  :disabled="!hasAnswers(student._id)" 
                  @click="openStudentModal(student)"
                  text="Puanla"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>Bu sınava atanan öğrenci yok.</div>
    </div>
    <StudentAnswerModal v-if="showModal" :student="selectedStudent" :examId="exam._id" @close="onModalClose" @scored="onStudentScored" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import StudentAnswerModal from '../components/StudentAnswerModal.vue';
import Button from '../components/ui/Button.vue';

const route = useRoute();
const exam = ref({});
const loading = ref(true);
const error = ref('');
const showModal = ref(false);
const selectedStudent = ref(null);
const studentScores = ref({}); // { studentId: totalScore or undefined }

const fetchExam = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/exams/${route.params.id}`);
    exam.value = res.data;
    await fetchAllScores();
  } catch (e) {
    error.value = e.response?.data?.message || 'Sınav yüklenemedi';
  } finally {
    loading.value = false;
  }
};

const fetchAllScores = async () => {
  if (!exam.value.assignedStudents) return;
  const scores = {};
  await Promise.all(
    exam.value.assignedStudents.map(async (student) => {
      try {
        const res = await api.get(`/exams/${exam.value._id}/answers/${student._id}`);
        const answers = res.data.answers || [];
        if (answers.length > 0) {
          const total = answers.reduce((sum, a) => sum + (a.score || 0), 0);
          scores[student._id] = total;
        } else {
          scores[student._id] = undefined;
        }
      } catch {
        scores[student._id] = undefined;
      }
    })
  );
  studentScores.value = scores;
};

const hasAnswers = (studentId) => {
  return studentScores.value[studentId] !== undefined && studentScores.value[studentId] !== '-';
};

const openStudentModal = (student) => {
  showModal.value = false;
  selectedStudent.value = null;
  setTimeout(() => {
    selectedStudent.value = student;
    showModal.value = true;
  }, 10);
};

const onModalClose = () => {
  showModal.value = false;
  selectedStudent.value = null;
};

const onStudentScored = async () => {
  showModal.value = false;
  await fetchAllScores();
};

onMounted(() => {
  fetchExam();
});
</script>

<style scoped>
.exam-results-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 0;
}
.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}
.error {
  color: #f44336;
}
.students-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  overflow: hidden;
}
.students-table th, .students-table td {
  padding: 14px 18px;
  text-align: left;
}
.students-table th {
  background: #f7f8fa;
  color: #1976d2;
  font-weight: 600;
  font-size: 1.08em;
}
.students-table tr:nth-child(even) {
  background: #f8f9fa;
}
.puanla-btn {
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.puanla-btn:disabled {
  background: #b0b0b0;
  color: #fff;
  cursor: not-allowed;
}
.puanla-btn:hover:enabled {
  background: #1565c0;
}
.score-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 16px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1.08em;
}
.not-finished-badge {
  background: #eee;
  color: #888;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 1.08em;
}
</style> 