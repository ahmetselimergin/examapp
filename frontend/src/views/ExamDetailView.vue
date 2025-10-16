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
            v-for="(tab, _) in tabs"
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
            <div class="results-header">
              <h2>{{ $t('examDetail.examResults') }}</h2>
              <p class="results-subtitle">{{ $t('examDetail.resultsSubtitle') }}</p>
            </div>
            
            <div v-if="examResults && examResults.length > 0" class="students-table">
              <div class="table-header">
                <div class="col-student">{{ $t('common.student') }}</div>
                <div class="col-attempt">{{ $t('examDetail.attempt') }}</div>
                <div class="col-answered">{{ $t('examDetail.answered') }}</div>
                <div class="col-score">{{ $t('common.score') }}</div>
                <div class="col-status">{{ $t('common.status') }}</div>
                <div class="col-actions">{{ $t('common.actions') }}</div>
              </div>
              
              <div class="table-body">
                <div 
                  v-for="result in examResults" 
                  :key="result._id" 
                  class="student-row"
                  @dblclick="openScoringModal(result)"
                >
                  <div class="col-student">
                    <div class="student-info">
                      <div class="student-avatar">{{ result.student.name.charAt(0).toUpperCase() }}</div>
                      <div class="student-details">
                        <div class="student-name">{{ result.student.name }}</div>
                        <div class="student-email">{{ result.student.email }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-attempt">
                    <span class="attempt-badge">#{{ result.attemptNumber }}</span>
                  </div>
                  
                  <div class="col-answered">
                    <span class="answer-count">{{ result.answeredQuestions }} / {{ result.totalQuestions }}</span>
                  </div>
                  
                  <div class="col-score">
                    <div class="score-display">
                      <span class="current-score">{{ result.score || 0 }}</span>
                      <span class="max-score">/ 100</span>
                    </div>
                  </div>
                  
                  <div class="col-status">
                    <span class="status-badge" :class="result.status">
                      {{ getResultStatus(result.status) }}
                    </span>
                  </div>
                  
                  <div class="col-actions">
                    <div class="action-dropdown">
                      <button class="action-btn" @click="openActionMenu($event, result)">
                        <span class="material-symbols-outlined">more_vert</span>
                      </button>
                      <div class="dropdown-menu" :class="{ show: activeDropdown === result._id }">
                        <button @click="openScoringModal(result)" class="dropdown-item">
                          <span class="material-symbols-outlined">grade</span>
                          {{ $t('examDetail.scoreStudent') }}
                        </button>
                        <button @click="viewStudentDetails(result)" class="dropdown-item">
                          <span class="material-symbols-outlined">visibility</span>
                          {{ $t('examDetail.viewDetails') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-results">
              <div class="empty-icon">
                <span class="material-symbols-outlined">assignment</span>
              </div>
              <h3>{{ $t('examDetail.noResults') }}</h3>
              <p>{{ $t('examDetail.noResultsDesc') }}</p>
            </div>
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

    <!-- Scoring Modal -->
    <div v-if="showScoringModal" class="modal-overlay" @click="closeScoringModal">
      <div class="scoring-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ $t('examDetail.scoreStudent') }}</h2>
          <div class="student-info">
            <strong>{{ selectedStudent?.student?.name }}</strong>
            <span class="attempt-info">{{ $t('examDetail.attempt') }} #{{ selectedStudent?.attemptNumber }}</span>
          </div>
          <button class="modal-close" @click="closeScoringModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="scoringLoading" class="scoring-loader">
            <div class="spinner"></div>
            <p>{{ $t('common.loading') }}</p>
          </div>
          
          <div v-else-if="studentAnswers" class="questions-list">
            <div 
              v-for="(question, index) in studentAnswers.questions" 
              :key="question._id"
              class="question-card"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-difficulty" :class="question.difficulty">
                  {{ $t(`questionBank.${question.difficulty}`) }}
                </span>
              </div>
              
              <div class="question-content">
                <div class="question-text">{{ question.text }}</div>
                
                <!-- Çoktan seçmeli/Tek seçim sorular -->
                <div v-if="['single_choice', 'multiple_select'].includes(question.type)" class="options-display">
                  <div 
                    v-for="(option, optIndex) in question.options" 
                    :key="optIndex"
                    class="option-item"
                    :class="{
                      'correct': isCorrectOption(question, optIndex),
                      'selected': isSelectedOption(question, optIndex),
                      'wrong-selection': isSelectedOption(question, optIndex) && !isCorrectOption(question, optIndex)
                    }"
                  >
                    <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <span class="option-text">{{ option }}</span>
                    <span v-if="isCorrectOption(question, optIndex)" class="correct-mark">
                      <span class="material-symbols-outlined">check_circle</span>
                    </span>
                    <span v-if="isSelectedOption(question, optIndex)" class="selected-mark">
                      <span class="material-symbols-outlined">radio_button_checked</span>
                    </span>
                  </div>
                </div>
                
                <!-- Doğru/Yanlış sorular -->
                <div v-else-if="question.type === 'true_false'" class="true-false-display">
                  <div class="tf-options">
                    <div class="tf-option" :class="{
                      'correct': question.correctAnswers === 'true',
                      'selected': question.studentAnswer === 'true',
                      'wrong-selection': question.studentAnswer === 'true' && question.correctAnswers !== 'true'
                    }">
                      <span>{{ $t('questionBank.true') }}</span>
                      <span v-if="question.correctAnswers === 'true'" class="correct-mark">✓</span>
                      <span v-if="question.studentAnswer === 'true'" class="selected-mark">●</span>
                    </div>
                    <div class="tf-option" :class="{
                      'correct': question.correctAnswers === 'false',
                      'selected': question.studentAnswer === 'false',
                      'wrong-selection': question.studentAnswer === 'false' && question.correctAnswers !== 'false'
                    }">
                      <span>{{ $t('questionBank.false') }}</span>
                      <span v-if="question.correctAnswers === 'false'" class="correct-mark">✓</span>
                      <span v-if="question.studentAnswer === 'false'" class="selected-mark">●</span>
                    </div>
                  </div>
                </div>
                
                <!-- Açık uçlu sorular -->
                <div v-else-if="question.type === 'open_ended'" class="open-answer-display">
                  <div class="student-answer">
                    <label>{{ $t('examDetail.studentAnswer') }}:</label>
                    <div class="answer-text">{{ question.studentAnswer || $t('examDetail.noAnswer') }}</div>
                  </div>
                  <div class="correct-answer">
                    <label>{{ $t('examDetail.correctAnswer') }}:</label>
                    <div class="answer-text">{{ question.correctAnswers }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Puan verme alanı - sadece açık uçlu sorular için -->
              <div v-if="question.isManualScoring" class="scoring-section">
                <div class="score-input-group">
                  <label>{{ $t('common.score') }}:</label>
                  <div class="score-controls">
                    <button @click="decreaseScore(index)" class="score-btn">-</button>
                    <input 
                      type="number" 
                      v-model.number="question.score"
                      :min="0" 
                      :max="question.maxScore"
                      class="score-input"
                    />
                    <button @click="increaseScore(index)" class="score-btn">+</button>
                    <span class="max-score">/ {{ question.maxScore }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Otomatik puanlanan sorular için puan gösterimi -->
              <div v-else class="auto-score-section">
                <div class="auto-score-display">
                  <label>{{ $t('examDetail.autoScore') }}:</label>
                  <span class="score-badge" :class="{ 
                    'correct': isQuestionCorrect(question),
                    'incorrect': !isQuestionCorrect(question)
                  }">
                    {{ isQuestionCorrect(question) ? question.maxScore : 0 }} / {{ question.maxScore }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="total-score">
            <strong>{{ $t('examDetail.totalScore') }}: {{ totalScore }} / {{ maxPossibleScore }}</strong>
          </div>
          <div class="modal-actions">
            <button @click="closeScoringModal" class="btn btn-secondary">
              {{ $t('common.cancel') }}
            </button>
            <button @click="saveScores" class="btn btn-primary" :disabled="savingScores">
              <span v-if="savingScores" class="btn-spinner"></span>
              {{ savingScores ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
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
  exam.value?.isFinished || ['admin', 'teacher'].includes(authStore.user?.role || '')
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

// Scoring Modal Variables
const showScoringModal = ref(false)
const selectedStudent = ref<any>(null)
const studentAnswers = ref<any>(null)
const scoringLoading = ref(false)
const savingScores = ref(false)
const activeDropdown = ref<string | null>(null)

// Scoring Modal Methods
const openActionMenu = (event: Event, result: any) => {
  event.stopPropagation()
  activeDropdown.value = activeDropdown.value === result._id ? null : result._id
  
  // Close dropdown when clicking outside
  const closeDropdown = (e: Event) => {
    const target = e.target as Node
    const currentTarget = event.currentTarget as Element | null
    if (!currentTarget?.contains(target)) {
      activeDropdown.value = null
      document.removeEventListener('click', closeDropdown)
    }
  }
  setTimeout(() => document.addEventListener('click', closeDropdown), 0)
}

const openScoringModal = async (result: any) => {
  selectedStudent.value = result
  showScoringModal.value = true
  activeDropdown.value = null
  
  // Load student answers
  await loadStudentAnswers(result.student._id, result.attemptNumber)
}

const closeScoringModal = () => {
  showScoringModal.value = false
  selectedStudent.value = null
  studentAnswers.value = null
  activeDropdown.value = null
}

const loadStudentAnswers = async (studentId: string, attemptNumber: number) => {
  try {
    scoringLoading.value = true
    const response = await api.get(`/exams/${route.params.id}/student/${studentId}/answers?attemptNumber=${attemptNumber}`)
    studentAnswers.value = response.data
  } catch (err: any) {
    console.error('Error loading student answers:', err)
    alert(err.response?.data?.message || t('common.error'))
  } finally {
    scoringLoading.value = false
  }
}

const viewStudentDetails = (result: any) => {
  // TODO: Implement student details view
  activeDropdown.value = null
}

// Question Analysis Methods
const isCorrectOption = (question: any, optionIndex: number) => {
  if (question.type === 'multiple_select') {
    return Array.isArray(question.correctAnswers) && 
           question.correctAnswers.includes(optionIndex.toString())
  } else {
    return question.correctAnswers === optionIndex.toString()
  }
}

const isSelectedOption = (question: any, optionIndex: number) => {
  if (question.type === 'multiple_select') {
    return Array.isArray(question.studentAnswer) && 
           question.studentAnswer.includes(optionIndex.toString())
  } else {
    return question.studentAnswer === optionIndex.toString()
  }
}

const isQuestionCorrect = (question: any) => {
  if (question.type === 'multiple_select') {
    const correctAnswers = Array.isArray(question.correctAnswers) ? question.correctAnswers.sort() : [];
    const userAnswers = Array.isArray(question.studentAnswer) ? question.studentAnswer.sort() : [];
    return JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
  } else if (question.type === 'true_false' || question.type === 'single_choice') {
    return question.correctAnswers === question.studentAnswer;
  }
  return false; // Open-ended questions are not auto-scored
}

// Score Management Methods  
const increaseScore = (questionIndex: number) => {
  const question = studentAnswers.value.questions[questionIndex]
  if (question.score < question.maxScore) {
    question.score++
  }
}

const decreaseScore = (questionIndex: number) => {
  const question = studentAnswers.value.questions[questionIndex]
  if (question.score > 0) {
    question.score--
  }
}

const totalScore = computed(() => {
  if (!studentAnswers.value?.questions) return 0
  return studentAnswers.value.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0)
})

const maxPossibleScore = computed(() => {
  if (!studentAnswers.value?.questions) return 0
  return studentAnswers.value.questions.reduce((sum: number, q: any) => sum + (q.maxScore || 1), 0)
})

const saveScores = async () => {
  try {
    savingScores.value = true
    
    // Only send scores for manually scored questions (open-ended)
    const scores = studentAnswers.value.questions
      .filter((q: any) => q.isManualScoring)
      .map((q: any) => ({
        questionId: q._id,
        score: q.score || 0
      }))

    await api.post(`/exams/${route.params.id}/student/${selectedStudent.value.student._id}/scores`, {
      scores,
      attemptNumber: selectedStudent.value.attemptNumber
    })

    // Update the results list with new scores
    const resultIndex = examResults.value.findIndex(r => 
      r.student._id === selectedStudent.value.student._id && 
      r.attemptNumber === selectedStudent.value.attemptNumber
    )
    
    if (resultIndex !== -1) {
      examResults.value[resultIndex].score = totalScore.value
    }

    alert(t('examDetail.scoresSaved'))
    closeScoringModal()
  } catch (err: any) {
    console.error('Error saving scores:', err)
    alert(err.response?.data?.message || t('common.error'))
  } finally {
    savingScores.value = false
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
// Students Table Styles
.students-table {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 100px 120px 140px 120px 100px;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  .student-row {
    display: grid;
    grid-template-columns: 2fr 100px 120px 140px 120px 100px;
    gap: 16px;
    padding: 20px;
    border-bottom: 1px solid var(--border-secondary);
    transition: all 0.2s ease;
    cursor: pointer;
    align-items: center;

    &:hover {
      background: var(--bg-secondary);
    }

    &:last-child {
      border-bottom: none;
    }

    .col-student .student-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .student-avatar {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .student-details {
        min-width: 0;

        .student-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .col-attempt .attempt-badge {
      display: inline-block;
      padding: 4px 8px;
      background: var(--bg-tertiary);
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .col-answered .answer-count {
      font-weight: 500;
      color: var(--text-primary);
    }

    .col-score .score-display {
      text-align: center;

      .current-score {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .max-score {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .percentage {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-top: 2px;
      }
    }

    .col-status .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.completed {
        background: rgba(34, 197, 94, 0.1);
        color: #059669;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }

      &.in_progress {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
        border: 1px solid rgba(245, 158, 11, 0.2);
      }
    }

    .col-actions {
      text-align: center;
      
      .action-dropdown {
        position: relative;

        .action-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;

          &:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
          }
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          min-width: 160px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px);
          transition: all 0.2s ease;
          z-index: 10;

          &.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 12px 16px;
            border: none;
            background: none;
            color: var(--text-primary);
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background: var(--bg-secondary);
            }

            &:first-child {
              border-radius: 8px 8px 0 0;
            }

            &:last-child {
              border-radius: 0 0 8px 8px;
            }

            .material-symbols-outlined {
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}

// Scoring Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.scoring-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-primary);

  .modal-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-secondary);
    border-radius: 16px 16px 0 0;

    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .student-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      strong {
        color: var(--text-primary);
      }

      .attempt-info {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }
    }

    .modal-close {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;

    .scoring-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-secondary);
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }

      p {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    }

    .questions-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .question-card {
      background: var(--bg-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-primary);
      overflow: hidden;

      .question-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border-secondary);

        .question-number {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .question-difficulty {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          &.easy {
            background: rgba(34, 197, 94, 0.1);
            color: #059669;
          }

          &.medium {
            background: rgba(245, 158, 11, 0.1);
            color: #d97706;
          }

          &.hard {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
          }
        }
      }

      .question-content {
        padding: 20px;

        .question-text {
          font-size: 1rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .options-display {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .option-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: 8px;
            border: 2px solid var(--border-secondary);
            transition: all 0.2s ease;
            position: relative;

            .option-letter {
              font-weight: 600;
              margin-right: 12px;
              color: var(--text-secondary);
            }

            .option-text {
              flex: 1;
              color: var(--text-primary);
            }

            .correct-mark, .selected-mark {
              position: absolute;
              right: 12px;
              color: #059669;
              font-size: 18px;
            }

            .selected-mark {
              color: #3b82f6;
            }

            &.correct {
              border-color: #059669;
              background: rgba(34, 197, 94, 0.05);
            }

            &.selected {
              border-color: #3b82f6;
              background: rgba(59, 130, 246, 0.05);
            }

            &.wrong-selection {
              border-color: #dc2626;
              background: rgba(239, 68, 68, 0.05);

              .selected-mark {
                color: #dc2626;
              }
            }
          }
        }

        .true-false-display .tf-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;

          .tf-option {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            border-radius: 8px;
            border: 2px solid var(--border-secondary);
            font-weight: 500;
            position: relative;
            transition: all 0.2s ease;

            &.correct {
              border-color: #059669;
              background: rgba(34, 197, 94, 0.05);
            }

            &.selected {
              border-color: #3b82f6;
              background: rgba(59, 130, 246, 0.05);
            }

            &.wrong-selection {
              border-color: #dc2626;
              background: rgba(239, 68, 68, 0.05);
            }

            .correct-mark, .selected-mark {
              position: absolute;
              right: 8px;
              top: 8px;
              font-weight: bold;
            }

            .correct-mark {
              color: #059669;
            }

            .selected-mark {
              color: #3b82f6;
            }
          }
        }

        .open-answer-display {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .student-answer, .correct-answer {
            label {
              display: block;
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: 8px;
            }

            .answer-text {
              padding: 12px 16px;
              background: var(--bg-tertiary);
              border-radius: 8px;
              border: 1px solid var(--border-secondary);
              color: var(--text-primary);
              min-height: 60px;
              line-height: 1.5;
            }
          }
        }
      }

      .scoring-section, .auto-score-section {
        padding: 20px;
        border-top: 1px solid var(--border-secondary);
        background: var(--bg-primary);
      }

      .auto-score-section {
        .auto-score-display {
          display: flex;
          align-items: center;
          gap: 16px;

          label {
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
          }

          .score-badge {
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;

            &.correct {
              background: rgba(34, 197, 94, 0.1);
              color: #22c55e;
              border: 1px solid rgba(34, 197, 94, 0.3);
            }

            &.incorrect {
              background: rgba(239, 68, 68, 0.1);
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
          }
        }
      }

      .scoring-section {
        .score-input-group {
          display: flex;
          align-items: center;
          gap: 16px;

          label {
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
          }

          .score-controls {
            display: flex;
            align-items: center;
            gap: 8px;

            .score-btn {
              width: 32px;
              height: 32px;
              border: none;
              background: var(--bg-tertiary);
              color: var(--text-primary);
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              transition: all 0.2s ease;

              &:hover {
                background: #667eea;
                color: white;
              }
            }

            .score-input {
              width: 60px;
              padding: 8px 12px;
              border: 2px solid var(--border-secondary);
              border-radius: 6px;
              text-align: center;
              font-weight: 600;
              background: var(--bg-primary);
              color: var(--text-primary);
              font-size: 1rem;

              &:focus {
                outline: none;
                border-color: #667eea;
              }
            }

            .max-score {
              color: var(--text-secondary);
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 24px;
    border-top: 1px solid var(--border-primary);
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .total-score {
      font-size: 1.125rem;
      color: var(--text-primary);
    }

    .modal-actions {
      display: flex;
      gap: 12px;

      .btn {
        padding: 10px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;

        &.btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);

          &:hover {
            background: var(--bg-quaternary, #9ca3af);
          }
        }

        &.btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Enhanced Empty State
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);

  .empty-icon {
    margin-bottom: 16px;

    .material-symbols-outlined {
      font-size: 4rem;
      color: var(--text-tertiary);
    }
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

.results-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .results-subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

// Responsive Design for New Components
@media (max-width: 1024px) {
  .students-table {
    .table-header,
    .student-row {
      grid-template-columns: 2fr 80px 100px 120px 100px 80px;
      gap: 12px;
      padding: 16px;
    }

    .table-header {
      font-size: 0.75rem;
    }
  }

  .scoring-modal {
    margin: 10px;
    max-width: calc(100vw - 20px);

    .modal-header {
      padding: 20px;
      flex-direction: column;
      gap: 12px;
      text-align: center;

      h2 {
        font-size: 1.25rem;
      }
    }

    .modal-body {
      padding: 20px;

      .question-card .question-content .options-display .option-item {
        padding: 10px 14px;
        font-size: 0.875rem;
      }
    }

    .modal-footer {
      padding: 20px;
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
}

@media (max-width: 768px) {
  .students-table {
    .table-header {
      display: none;
    }

    .student-row {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);

      .col-student {
        order: 1;
      }

      .col-attempt, .col-answered, .col-score, .col-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        &::before {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      }

      .col-attempt {
        order: 2;
        &::before { content: 'Attempt:'; }
      }

      .col-answered {
        order: 3;
        &::before { content: 'Answered:'; }
      }

      .col-score {
        order: 4;
        &::before { content: 'Score:'; }
      }

      .col-status {
        order: 5;
        &::before { content: 'Status:'; }
      }

      .col-actions {
        order: 6;
        text-align: right;
      }
    }
  }

  .scoring-modal {
    .modal-body .question-card {
      .question-content .true-false-display .tf-options {
        grid-template-columns: 1fr;
      }

      .scoring-section .score-input-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .score-controls {
          align-self: stretch;
          justify-content: center;
        }
      }
    }
  }
}

</style>
