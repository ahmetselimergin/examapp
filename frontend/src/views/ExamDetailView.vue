<template>
  <div class="exam-detail">
    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="exam-content">
      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button
          v-for="(tab, idx) in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key, disabled: tab.disabled }]"
          @click="!tab.disabled && (activeTab = tab.key)"
          :disabled="tab.disabled"
        >
          {{ tab.label }}
        </button>
      </div>
      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Sınav Bilgileri Tab -->
        <div v-if="activeTab === 'info'">
          <div class="exam-header">
            <div class="header-top">
              <h1>{{ exam.title }}</h1>
              <div class="exam-status" :class="getExamStatus(exam)">
                {{ getExamStatusText(exam) }}
              </div>
            </div>
            <p class="description">{{ exam.description }}</p>
            <div class="exam-info-grid">
              <div class="info-item">
                <span class="material-symbols-outlined">schedule</span>
                <div class="info-content">
                  <div class="info-label">Başlangıç</div>
                  <div class="info-value">{{ formatDateTime(exam.startTime) }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="material-symbols-outlined">schedule</span>
                <div class="info-content">
                  <div class="info-label">Bitiş</div>
                  <div class="info-value">{{ formatDateTime(exam.endTime) }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="material-symbols-outlined">timer</span>
                <div class="info-content">
                  <div class="info-label">Süre</div>
                  <div class="info-value">{{ exam.duration }} dakika</div>
                </div>
              </div>
              <div class="info-item">
                <span class="material-symbols-outlined">quiz</span>
                <div class="info-content">
                  <div class="info-label">Soru Sayısı</div>
                  <div class="info-value">{{ exam.questions?.length || 0 }}</div>
                </div>
              </div>
            </div>
            <div class="meta-info">
              <span>Oluşturan: {{ exam.createdBy?.name }}</span>
              <span>Oluşturulma Tarihi: {{ formatDate(exam.createdAt) }}</span>
            </div>
          </div>
        </div>
        <!-- Sorular Tab -->
        <div v-if="activeTab === 'questions'">
          <div class="questions-section">
            <h2>Sorular ({{ exam.questions?.length || 0 }})</h2>
            <div v-if="exam.questions && exam.questions.length > 0">
              <div v-for="(question, index) in exam.questions" :key="question._id" class="question-card">
                <div class="question-header">
                  <h3>Soru {{ index + 1 }}</h3>
                  <div class="question-type">{{ getQuestionType(question.type) }}</div>
                </div>
                <p class="question-text">{{ question.text }}</p>
                <div v-if="question.options && question.options.length > 0" class="options">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option">
                    <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                </div>
                <div class="question-meta">
                  <span class="difficulty">Zorluk: {{ getDifficultyLabel(question.difficulty) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-questions">Bu sınavda henüz soru bulunmuyor.</div>
          </div>
        </div>
        <!-- Öğrenciler Tab -->
        <div v-if="activeTab === 'students'">
          <div class="assigned-students-section" v-if="exam.assignedStudents && exam.assignedStudents.length > 0">
            <h2>Atanan Öğrenciler ({{ exam.assignedStudents.length }})</h2>
            <div class="students-grid">
              <div v-for="student in exam.assignedStudents" :key="student._id" class="student-card">
                <div class="student-avatar">{{ student.name.charAt(0).toUpperCase() }}</div>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-email">{{ student.email }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>Bu sınava atanan öğrenci yok.</div>
        </div>
        <!-- Sonuçlar Tabı (artık admin/teacher için her zaman erişilebilir) -->
        <div v-if="activeTab === 'results' && isResultsTabEnabled">
          <ExamResultsView :examId="exam._id" />
        </div>
      </div>
      <div class="actions" v-if="canEdit">
        <button @click="editExam" class="btn btn-primary">Düzenle</button>
        <button @click="deleteExam" class="btn btn-danger">Sil</button>
        <button v-if="!exam.isFinished" @click="finishExam" class="btn btn-warning">Sınavı Bitir</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import ExamResultsView from './ExamResultsView.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const exam = ref<any>(null)
const loading = ref(true)
const error = ref('')
const canEdit = ref(false)

const isResultsTabEnabled = computed(() =>
  exam.value?.isFinished || ['admin', 'teacher'].includes(authStore.user?.role)
)

const tabs = computed(() => [
  { key: 'info', label: 'Sınav Bilgileri' },
  { key: 'questions', label: 'Sorular' },
  { key: 'students', label: 'Öğrenciler' },
  { key: 'results', label: 'Sonuçlar', disabled: !isResultsTabEnabled.value }
])
const activeTab = ref('info')

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR')
}
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
const getExamStatus = (exam: any) => {
  const now = new Date()
  const startTime = new Date(exam.startTime)
  const endTime = new Date(exam.endTime)
  if (now < startTime) return 'upcoming'
  if (now >= startTime && now <= endTime) return 'active'
  return 'completed'
}
const getExamStatusText = (exam: any) => {
  const status = getExamStatus(exam)
  const statusMap: { [key: string]: string } = {
    upcoming: 'Yakında',
    active: 'Aktif',
    completed: 'Tamamlandı'
  }
  return statusMap[status]
}
const getQuestionType = (type: string) => {
  const types: { [key: string]: string } = {
    single_choice: 'Çoktan Tek Seçmeli',
    multiple_select: 'Çoktan Çok Seçmeli',
    open_ended: 'Kısa Cevap',
    true_false: 'Doğru/Yanlış',
  }
  return types[type] || type
}
const getDifficultyLabel = (difficulty: string) => {
  const difficultyMap: { [key: string]: string } = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor'
  }
  return difficultyMap[difficulty] || difficulty
}
const fetchExam = async () => {
  try {
    const response = await api.get(`/exams/${route.params.id}`)
    exam.value = response.data
    canEdit.value = authStore.user?.role === 'admin' ||
      exam.value.createdBy?._id === authStore.user?._id
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Sınav yüklenirken bir hata oluştu'
  } finally {
    loading.value = false
  }
}
const editExam = () => {
  router.push(`/exams/${route.params.id}/edit`)
}
const deleteExam = async () => {
  if (!confirm('Bu sınavı silmek istediğinizden emin misiniz?')) return
  try {
    await api.delete(`/exams/${route.params.id}`)
    router.push('/exams')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Sınav silinemedi')
  }
}
const finishExam = async () => {
  if (!confirm('Sınavı bitirmek istediğinize emin misiniz?')) return
  try {
    await api.post(`/exams/${route.params.id}/finish`)
    await fetchExam()
    activeTab.value = 'results'
  } catch (err: any) {
    alert(err.response?.data?.message || 'Sınav bitirilemedi')
  }
}
onMounted(() => {
  fetchExam()
})
</script>

<style scoped>
.exam-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 0 0 0;
}
.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}
.error { color: #f44336; }

.tab-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
  border-bottom: 2px solid #e3e7ef;
  background: none;
}
.tab-btn {
  padding: 0.8em 2em;
  border: none;
  background: #f7f8fa;
  border-radius: 12px 12px 0 0;
  font-weight: 500;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  color: #1976d2;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.tab-btn.active {
  background: #fff;
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  z-index: 2;
}
.tab-btn.disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
.tab-content {
  background: #fff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  margin-bottom: 2.5rem;
  min-height: 350px;
}
.exam-header {
  margin-bottom: 32px;
  background: #fff;
  border-radius: 12px;
  padding: 32px 32px 24px 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.header-top h1 {
  margin: 0;
  color: #222;
  font-size: 2.1em;
  font-weight: 700;
  flex: 1;
}
.exam-status {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #e8f5e8;
  color: #2e7d32;
}
.description {
  color: #555;
  margin: 18px 0 0 0;
  font-size: 1.13em;
  line-height: 1.5;
}
.exam-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 22px;
  margin: 32px 0 0 0;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 18px;
  background: #f8f9fa;
  border-radius: 8px;
}
.material-symbols-outlined {
  font-size: 28px;
  color: #1976d2;
  min-width: 28px;
}
.info-label {
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.info-value {
  font-weight: 500;
  color: #222;
  font-size: 1.08em;
}
.meta-info {
  display: flex;
  gap: 24px;
  color: #888;
  font-size: 1em;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #f0f0f0;
}
.assigned-students-section {
  margin: 0 0 32px 0;
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 18px;
  margin-top: 18px;
}
.student-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 18px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.student-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
}
.student-info { flex: 1; }
.student-name { font-weight: 600; margin-bottom: 2px; }
.student-email { font-size: 14px; color: #666; }
.questions-section {
  margin: 0 0 32px 0;
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.question-card {
  background: #f8f9fa;
  padding: 20px 18px;
  margin-bottom: 18px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.question-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}
.question-type {
  background: #1976d2;
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}
.question-text {
  font-weight: 500;
  margin-bottom: 12px;
  line-height: 1.4;
}
.options {
  margin: 12px 0 0 0;
}
.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  margin: 7px 0;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}
.option-letter {
  font-weight: bold;
  color: #1976d2;
  min-width: 20px;
}
.option-text { flex: 1; }
.question-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.97em;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
}
.difficulty {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.no-questions {
  text-align: center;
  color: #666;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}
.actions {
  margin-top: 0;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}
.btn {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.08em;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.btn-primary {
  background: #1976d2;
  color: white;
}
.btn-primary:hover {
  background: #1565c0;
}
.btn-danger {
  background: #f44336;
  color: white;
}
.btn-danger:hover {
  background: #d32f2f;
}
.btn-warning {
  background: #ffb300;
  color: #222;
}
.btn-warning:hover {
  background: #ffa000;
}
@media (max-width: 900px) {
  .exam-detail { max-width: 100vw; padding: 0; }
  .tab-content, .exam-header, .assigned-students-section, .questions-section {
    padding: 1.2rem 0.7rem;
  }
}
@media (max-width: 600px) {
  .tab-btn { font-size: 1em; padding: 0.6em 0.7em; }
  .tab-content { min-height: 200px; }
  .students-grid { grid-template-columns: 1fr; }
}
</style>