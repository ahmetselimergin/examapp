<template>
  <div class="exam-detail-container">
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="exam-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">{{ exam.title }}</h1>
            <p class="page-subtitle">{{ exam.description || $t('common.noDescription') }}</p>
          </div>
          <div class="header-right">
            <div class="exam-status-badge" :class="getExamStatus(exam)">
              <span class="material-symbols-outlined">{{ getStatusIcon(exam) }}</span>
              {{ getExamStatusText(exam) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <div class="tab-nav">
          <button
            v-for="(tab, idx) in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key, disabled: tab.disabled }]"
            @click="!tab.disabled && (activeTab = tab.key)"
            :disabled="tab.disabled"
          >
            <span class="material-symbols-outlined">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Sınav Bilgileri Tab -->
        <div v-if="activeTab === 'info'" class="tab-panel">
          <div class="info-section">
            <div class="exam-info-grid">
              <div class="info-card">
                <div class="info-icon">
                  <span class="material-symbols-outlined">schedule</span>
                </div>
                <div class="info-content">
                  <div class="info-label">{{ $t('exams.startTime') }}</div>
                  <div class="info-value">{{ formatDateTime(exam.startTime) }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="info-icon">
                  <span class="material-symbols-outlined">event</span>
                </div>
                <div class="info-content">
                  <div class="info-label">{{ $t('exams.endTime') }}</div>
                  <div class="info-value">{{ formatDateTime(exam.endTime) }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="info-icon">
                  <span class="material-symbols-outlined">timer</span>
                </div>
                <div class="info-content">
                  <div class="info-label">{{ $t('exams.duration') }}</div>
                  <div class="info-value">{{ exam.duration }} {{ $t('common.minutes') }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="info-icon">
                  <span class="material-symbols-outlined">quiz</span>
                </div>
                <div class="info-content">
                  <div class="info-label">{{ $t('examDetail.questionCount') }}</div>
                  <div class="info-value">{{ exam.questions?.length || 0 }}</div>
                </div>
              </div>
            </div>
            <div class="meta-info">
              <div class="meta-item">
                <span class="material-symbols-outlined">person</span>
                <span>{{ $t('examDetail.createdBy') }}: {{ exam.createdBy?.name }}</span>
              </div>
              <div class="meta-item">
                <span class="material-symbols-outlined">calendar_today</span>
                <span>{{ $t('examDetail.createdAt') }}: {{ formatDate(exam.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sorular Tab -->
        <div v-if="activeTab === 'questions'" class="tab-panel">
          <div class="questions-section">
            <h2>{{ $t('examDetail.questionsTitle') }} ({{ exam.questions?.length || 0 }})</h2>
            <div v-if="exam.questions && exam.questions.length > 0">
              <div v-for="(question, index) in exam.questions" :key="question._id" class="question-card">
                <div class="question-header">
                  <h3>{{ $t('examDetail.questionNumber') }} {{ index + 1 }}</h3>
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
                  <span class="difficulty">{{ $t('questionBank.difficulty') }}: {{ getDifficultyLabel(question.difficulty) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-questions">{{ $t('examDetail.noQuestions') }}</div>
          </div>
        </div>

        <!-- Öğrenciler Tab -->
        <div v-if="activeTab === 'students'" class="tab-panel">
          <div class="assigned-students-section" v-if="exam.assignedStudents && exam.assignedStudents.length > 0">
            <h2>{{ $t('examDetail.assignedStudents') }} ({{ exam.assignedStudents.length }})</h2>
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
          <div v-else class="no-students">{{ $t('examDetail.noStudents') }}</div>
        </div>

        <!-- Sonuçlar Tab -->
        <div v-if="activeTab === 'results'" class="tab-panel">
          <div class="results-section">
            <h2>{{ $t('examDetail.examResults') }}</h2>
            <div v-if="examResults && examResults.length > 0">
              <div v-for="result in examResults" :key="result._id" class="result-card">
                <div class="student-info">
                  <div class="student-avatar">{{ result.student.name.charAt(0).toUpperCase() }}</div>
                  <div class="student-details">
                    <div class="student-name">{{ result.student.name }}</div>
                    <div class="student-email">{{ result.student.email }}</div>
                  </div>
                </div>
                <div class="result-details">
                  <div class="score">{{ result.score || 0 }} / {{ exam.questions?.length || 0 }}</div>
                  <div class="status" :class="result.status">{{ getResultStatus(result.status) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-results">{{ $t('examDetail.noResults') }}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions" v-if="canEdit">
        <button class="btn btn-primary" @click="editExam">
          <span class="material-symbols-outlined">edit</span>
          {{ $t('common.edit') }}
        </button>
        <button class="btn btn-danger" @click="deleteExam">
          <span class="material-symbols-outlined">delete</span>
          {{ $t('common.delete') }}
        </button>
        <button class="btn btn-warning" @click="finishExam" v-if="!exam.isFinished">
          <span class="material-symbols-outlined">check</span>
          {{ $t('exam.finish') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const exam = ref<any>({})
const examResults = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const canEdit = ref(false)

const isResultsTabEnabled = computed(() =>
  exam.value?.isFinished || ['admin', 'teacher'].includes(authStore.user?.role)
)

const tabs = computed(() => [
  { key: 'info', label: t('examDetail.examInfo'), icon: 'info', disabled: false },
  { key: 'questions', label: t('examDetail.questions'), icon: 'quiz', disabled: false },
  { key: 'students', label: t('examDetail.students'), icon: 'group', disabled: false },
  { key: 'results', label: t('examDetail.results'), icon: 'analytics', disabled: !isResultsTabEnabled.value }
])

const getStatusIcon = (exam: any) => {
  const status = getExamStatus(exam)
  const iconMap: { [key: string]: string } = {
    upcoming: 'schedule',
    active: 'play_circle',
    completed: 'check_circle'
  }
  return iconMap[status] || 'help'
}

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
    upcoming: t('exams.upcoming'),
    active: t('exams.active'),
    completed: t('exams.completed')
  }
  return statusMap[status]
}

const getQuestionType = (type: string) => {
  const types: { [key: string]: string } = {
    single_choice: t('questionBank.singleChoice'),
    multiple_select: t('questionBank.multipleChoice'),
    open_ended: t('questionBank.openEnded'),
    true_false: t('questionBank.trueFalse'),
  }
  return types[type] || type
}

const getDifficultyLabel = (difficulty: string) => {
  const difficultyMap: { [key: string]: string } = {
    easy: t('questionBank.easy'),
    medium: t('questionBank.medium'),
    hard: t('questionBank.hard')
  }
  return difficultyMap[difficulty] || difficulty
}

const getResultStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    completed: t('examDetail.completed'),
    in_progress: t('examDetail.inProgress'),
    not_started: t('examDetail.notStarted')
  }
  return statusMap[status] || status
}

const fetchExam = async () => {
  try {
    const response = await api.get(`/exams/${route.params.id}`)
    exam.value = response.data
    canEdit.value = authStore.user?.role === 'admin' ||
      exam.value.createdBy?._id === authStore.user?._id
  } catch (err: any) {
    error.value = err.response?.data?.message || t('common.error')
  }
}

const fetchResults = async () => {
  if (!isResultsTabEnabled.value) return
  try {
    const response = await api.get(`/exams/${route.params.id}/results`)
    examResults.value = response.data
  } catch (err: any) {
    console.error('Error fetching results:', err)
  }
}

const editExam = () => {
  router.push(`/exams/${exam.value._id}/edit`)
}

const deleteExam = async () => {
  if (confirm(t('examDetail.confirmDelete'))) {
    try {
      await api.delete(`/exams/${exam.value._id}`)
      router.push('/exams')
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'))
    }
  }
}

const finishExam = async () => {
  if (confirm(t('examDetail.confirmFinish'))) {
    try {
      await api.patch(`/exams/${exam.value._id}/finish`)
      exam.value.isFinished = true
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'))
    }
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchExam(), fetchResults()])
  loading.value = false
})
</script>

<style scoped lang="scss">
.exam-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

// Page Header
.page-header {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;

    .header-left {
      flex: 1;

      .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px 0;
        line-height: 1.2;
      }

      .page-subtitle {
        font-size: 1.125rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.4;
      }
    }

    .header-right {
      .exam-status-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &.upcoming {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        &.active {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        &.completed {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .material-symbols-outlined {
          font-size: 18px;
        }
      }
    }
  }
}

// Tab Navigation
.tab-navigation {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);

  .tab-nav {
    display: flex;
    gap: 4px;

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background: transparent;
      border: none;
      border-radius: 12px;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(.disabled) {
        background: var(--bg-secondary);
        color: var(--text-primary);
      }

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .material-symbols-outlined {
        font-size: 18px;
      }
    }
  }
}

// Tab Content
.tab-content {
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  .tab-panel {
    padding: 32px;
  }
}

// Info Section
.info-section {
  .exam-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;

    .info-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-secondary);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--border-primary);
      }

      .info-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;

        .material-symbols-outlined {
          font-size: 24px;
        }
      }

      .info-content {
        flex: 1;

        .info-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
          font-weight: 500;
        }

        .info-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }
  }

  .meta-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-secondary);

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.875rem;

      .material-symbols-outlined {
        font-size: 16px;
      }
    }
  }
}

// Questions Section
.questions-section {
  h2 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 24px 0;
  }

  .question-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--border-primary);
      box-shadow: var(--shadow-sm);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        color: var(--text-primary);
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
      }

      .question-type {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
      }
    }

    .question-text {
      font-weight: 500;
      margin-bottom: 16px;
      line-height: 1.6;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .options {
      margin: 16px 0;

      .option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: var(--bg-tertiary);
        margin: 8px 0;
        border-radius: 8px;
        border: 1px solid var(--border-secondary);
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--border-primary);
        }

        .option-letter {
          font-weight: 700;
          color: #667eea;
          min-width: 24px;
          font-size: 0.875rem;
        }

        .option-text {
          flex: 1;
          color: var(--text-primary);
          line-height: 1.4;
        }
      }
    }

    .question-meta {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border-secondary);

      .difficulty {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 500;
      }
    }
  }

  .no-questions {
    text-align: center;
    color: var(--text-secondary);
    padding: 60px 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 2px dashed var(--border-secondary);
    font-size: 1rem;
  }
}

// Students Section
.assigned-students-section {
  h2 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 24px 0;
  }

  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    .student-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-secondary);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--border-primary);
      }

      .student-avatar {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .student-info {
        flex: 1;

        .student-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .student-email {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }
    }
  }
}

.no-students {
  text-align: center;
  color: var(--text-secondary);
  padding: 60px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border-secondary);
  font-size: 1rem;
}

// Results Section
.results-section {
  h2 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 24px 0;
  }

  .result-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--border-primary);
      box-shadow: var(--shadow-sm);
    }

    .student-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .student-avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .student-details {
        .student-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .student-email {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }
    }

    .result-details {
      text-align: right;

      .score {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .status {
        font-size: 0.75rem;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 12px;
        text-transform: uppercase;

        &.completed {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        &.in_progress {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        &.not_started {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
      }
    }
  }
}

.no-results {
  text-align: center;
  color: var(--text-secondary);
  padding: 60px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border-secondary);
  font-size: 1rem;
}

// Action Buttons
.actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 24px 32px;
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  margin-top: 24px;

  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &.btn-primary {
      background: #1976d2;
      color: white;

      &:hover {
        background: #1565c0;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      }
    }

    &.btn-danger {
      background: #f44336;
      color: white;

      &:hover {
        background: #d32f2f;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
      }
    }

    &.btn-warning {
      background: #ff9800;
      color: white;

      &:hover {
        background: #f57c00;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
      }
    }
  }
}

// Loading & Error States
.loading, .error {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.error {
  color: var(--error-color, #f44336);
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

// Responsive Design
@media (max-width: 1024px) {
  .exam-detail-container {
    padding: 16px;
  }

  .page-header .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .info-section .exam-info-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .tab-navigation .tab-nav .tab-btn {
    padding: 10px 12px;
    font-size: 0.8rem;
    
    .material-symbols-outlined {
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .tab-navigation .tab-nav {
    flex-direction: column;
    gap: 4px;
  }

  .info-section .exam-info-grid {
    grid-template-columns: 1fr;
  }

  .students-grid {
    grid-template-columns: 1fr !important;
  }

  .actions {
    flex-direction: column;
    gap: 12px;

    .btn {
      justify-content: center;
    }
  }
}
</style>
