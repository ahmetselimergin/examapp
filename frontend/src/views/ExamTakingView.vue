<template>
  <div class="exam-taking-container">
    <!-- Modern Split-Screen Exam Layout -->
    <div v-if="!loading" class="modern-exam-container">
      <div class="exam-split-layout">
        
        <!-- Left Side: Question Card -->
        <div class="question-section">
          <div class="question-card">
            <!-- Navigation Header -->
            <div class="navigation-header">
              <button class="nav-arrow nav-arrow-left" @click="previousQuestion" :disabled="currentQuestionIndex === 0">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              
              <h1 class="question-title">{{ currentQuestionIndex + 1 }}. Question</h1>
              
              <button class="nav-arrow nav-arrow-right" @click="nextQuestion" :disabled="currentQuestionIndex >= (exam.questions?.length || 1) - 1">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <!-- Question Text -->
            <div class="question-text">
              {{ currentQuestion.text || 'Question text will appear here...' }}
            </div>

            <!-- Answer Options -->
            <div class="answer-section">
              <!-- Multiple Choice / Single Choice -->
              <div v-if="currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'single_choice'" class="options-container">
                <label v-for="(option, index) in currentQuestion.options" :key="index" 
                       class="option-card" :class="{ selected: answers[currentQuestionIndex] === index.toString() }">
                  <input type="radio" :name="`question-${currentQuestionIndex}`" :value="index.toString()" 
                         v-model="answers[currentQuestionIndex]" />
                  <span class="option-text">{{ option }}</span>
                </label>
              </div>

              <!-- Multiple Select -->
              <div v-else-if="currentQuestion.type === 'multiple_select'" class="options-container">
                <label v-for="(option, index) in currentQuestion.options" :key="index" 
                       class="option-card" :class="{ selected: (answers[currentQuestionIndex] || []).includes(index.toString()) }">
                  <input type="checkbox" :value="index.toString()" 
                         @change="toggleMultipleAnswer(index.toString())" 
                         :checked="(answers[currentQuestionIndex] || []).includes(index.toString())" />
                  <span class="option-text">{{ option }}</span>
                </label>
              </div>

              <!-- True/False -->
              <div v-else-if="currentQuestion.type === 'true_false'" class="true-false-container">
                <label class="option-card" :class="{ selected: answers[currentQuestionIndex] === 'true' }">
                  <input type="radio" :name="`question-${currentQuestionIndex}`" value="true" 
                         v-model="answers[currentQuestionIndex]" />
                  <span class="option-text">Doğru</span>
                </label>
                <label class="option-card" :class="{ selected: answers[currentQuestionIndex] === 'false' }">
                  <input type="radio" :name="`question-${currentQuestionIndex}`" value="false" 
                         v-model="answers[currentQuestionIndex]" />
                  <span class="option-text">Yanlış</span>
                </label>
              </div>

              <!-- Open Ended -->
              <div v-else-if="currentQuestion.type === 'open_ended'" class="open-text-container">
                <textarea 
                  v-model="answers[currentQuestionIndex]" 
                  placeholder="Write your answer here..."
                  class="answer-textarea">
                </textarea>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Side: Timer & Controls -->
        <div class="control-section">
          <!-- Timer Card -->
          <div class="timer-card">
            <h3>{{ t('examTaking.timeRemaining') }}</h3>
            <div class="timer-circle" :class="{ warning: timeWarning, danger: timeDanger }">
              <span class="timer-text">{{ formatTime(remainingTime) }}</span>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="progress-card">
            <h3>{{ t('examTaking.progress') }}</h3>
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-label">{{ t('examTaking.answered') }}</span>
                <span class="stat-value">{{ answeredCount }} / {{ exam.questions?.length || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ t('examTaking.remaining') }}</span>
                <span class="stat-value">{{ (exam.questions?.length || 0) - answeredCount }}</span>
              </div>
            </div>
          </div>

          <!-- Questions Overview -->
          <div class="questions-card">
            <h3>{{ t('examTaking.questions') }}</h3>
            <div class="questions-grid">
              <button v-for="(_, index) in exam.questions" :key="index" 
                      class="question-dot"
                      :class="{ 
                        current: index === currentQuestionIndex,
                        answered: answers[index] !== undefined && answers[index] !== null && answers[index] !== ''
                      }"
                      @click="goToQuestion(index)">
                {{ index + 1 }}
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="submit-card">
            <button class="submit-btn" @click="showFinishModal = true">
              {{ t('examTaking.completeExam') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Finish Confirmation Modal -->
    <Modal v-if="showFinishModal" :modelValue="showFinishModal" @update:modelValue="showFinishModal = $event"
      :title="t('examTaking.confirmSubmission')">
        <div class="finish-modal-content">
          <p>{{ t('examTaking.confirmSubmissionMessage') }}</p>
          <div class="answer-summary">
            <p><strong>{{ t('examTaking.answered') }}:</strong> {{ answeredCount }} / {{ exam.questions?.length || 0 }}</p>
            <p><strong>{{ t('examTaking.unanswered') }}:</strong> {{ (exam.questions?.length || 0) - answeredCount }}</p>
          </div>
        </div>

        <!-- @ts-ignore -->
        <template #footer>
          <div class="modal-actions">
            <Button @click="showFinishModal = false" styleType="secondary" :text="t('common.cancel')" />
            <Button @click="finishExam" styleType="primary" :text="t('examTaking.submitExam')" :loading="submitting" />
          </div>
        </template>
      </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import Button from '../components/ui/Button.vue';
import Modal from '../components/ui/Modal.vue';
import api from '../services/api';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useToast();

// Exam data
const exam = ref<any>({});
const loading = ref(true);
const submitting = ref(false);

// Question navigation
const currentQuestionIndex = ref(0);
const answers = ref<any[]>([]);

// Timer
const remainingTime = ref(0);
const timeSpent = ref(0);
const timerInterval = ref<number | null>(null);
const startTime = ref<Date | null>(null);

// Modals
const showFinishModal = ref(false);

// Attempt tracking
const attemptData = ref<any>(null);

// Load exam data
const loadExam = async () => {
  try {
    loading.value = true;
    
    // Get attemptId from localStorage (set by ExamStudentView)
    const storedAttemptData = localStorage.getItem(`examAttempt_${route.params.id}`);
    if (!storedAttemptData) {
      showError(t('exam.attemptNotFound'));
      router.push('/exams');
      return;
    }
    
    attemptData.value = JSON.parse(storedAttemptData);
    
    // Load exam details
    const response = await api.get(`/exams/${route.params.id}`);
    exam.value = response.data;
    
    // Initialize answers array
    answers.value = new Array(exam.value.questions?.length || 0).fill(null);
    
    // Start timer
    startTimer();
    
  } catch (error: any) {
    console.error('Load exam error:', error);
    showError(error?.response?.data?.message || t('exam.loadError'));
    router.push('/exams');
  } finally {
    loading.value = false;
  }
};

// Computed properties
const currentQuestion = computed(() => {
  return exam.value.questions?.[currentQuestionIndex.value]?.questionId || {};
});

const answeredCount = computed(() => {
  return answers.value.filter(answer =>
    answer !== undefined && answer !== null && answer !== ''
  ).length;
});

const timeWarning = computed(() => {
  const totalTime = exam.value.duration * 60; // Convert to seconds
  return remainingTime.value <= totalTime * 0.25; // 25% remaining
});

const timeDanger = computed(() => {
  const totalTime = exam.value.duration * 60;
  return remainingTime.value <= totalTime * 0.1; // 10% remaining
});

// Navigation functions
const toggleMultipleAnswer = (option: string) => {
  let currentAnswers = answers.value[currentQuestionIndex.value] || [];
  if (!Array.isArray(currentAnswers)) {
    currentAnswers = [];
  }

  const index = currentAnswers.indexOf(option);
  if (index > -1) {
    currentAnswers.splice(index, 1);
  } else {
    currentAnswers.push(option);
  }

  answers.value[currentQuestionIndex.value] = [...currentAnswers];
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < exam.value.questions.length - 1) {
    currentQuestionIndex.value++;
  }
};

const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index;
};

// Timer functions
const startTimer = () => {
  if (!exam.value.duration) return;
  
  remainingTime.value = exam.value.duration * 60; // Convert minutes to seconds
  startTime.value = new Date();
  
  timerInterval.value = setInterval(() => {
    remainingTime.value--;
    timeSpent.value++;
    
    if (remainingTime.value <= 0) {
      // Auto-submit when time is up
      finishExam();
    }
  }, 1000);
};

// Lifecycle hooks
onMounted(() => {
  loadExam();
});

onUnmounted(() => {
  stopTimer();
});

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const finishExam = async () => {
  try {
    submitting.value = true;
    stopTimer();

    // Prepare answers for submission
    const submissionAnswers = answers.value.map((answer, index) => ({
      questionId: exam.value.questions[index].questionId._id,
      response: answer
    }));

    // Submit exam
    await api.post(`/exams/${exam.value._id}/submit-answers`, {
      answers: submissionAnswers,
      attemptId: attemptData.value?.attemptId
    });

    showSuccess('Exam submitted successfully!');
    showFinishModal.value = false;
    
    // Clear attempt data from localStorage
    localStorage.removeItem(`examAttempt_${exam.value._id}`);
    
    router.push('/exams');
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    const errorMessage = error.response?.data?.message || 'Failed to submit exam. Please try again.';
    showError(errorMessage);
  } finally {
    submitting.value = false;
  }
};

// Prevent page refresh/close during exam
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (!loading.value && timerInterval.value) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
};

// Format time for display
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Lifecycle hooks
onMounted(() => {
  loadExam();
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  stopTimer();
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style lang="scss" scoped>
@import "../assets/styles/_framework.scss";

/* Main Container */
.exam-taking-container {
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* Modern Exam Layout */
.modern-exam-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.exam-split-layout {
  display: flex;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Question Section (Left) */
.question-section {
  flex: 2;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border-secondary);
}

.question-card {
  width: 100%;
  max-width: 700px;
}

/* Navigation Header */
.navigation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 20px;
}

.nav-arrow {
  width: 50px;
  height: 50px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    color: #667eea;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .material-symbols-outlined {
    font-size: 28px;
  }
}

.question-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  flex: 1;
}

.question-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 40px;
  padding: 30px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

/* Answer Options */
.answer-section {
  margin-bottom: 40px;
}

.options-container,
.true-false-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  
  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
  
  input[type="radio"], 
  input[type="checkbox"] {
    margin-right: 16px;
    width: 20px;
    height: 20px;
    appearance: none;
    border: 2px solid var(--border-secondary);
    background: var(--bg-primary);
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    
    &:checked {
      border-color: #667eea;
      background: #667eea;
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      }
    }
    
    &:focus {
      outline: 2px solid rgba(102, 126, 234, 0.3);
      outline-offset: 2px;
    }
  }
  
  input[type="checkbox"] {
    border-radius: 4px;
    
    &:checked {
      &::after {
        content: '✓';
        width: auto;
        height: auto;
        background: none;
        color: white;
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
  
  .option-text {
    font-size: 1.1rem;
    color: var(--text-primary);
    flex: 1;
    font-weight: 500;
  }
}

.open-text-container {
  .answer-textarea {
    width: 100%;
    min-height: 150px;
    padding: 20px;
    border: 2px solid var(--border-secondary);
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.5;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }
}


/* Control Section (Right) */
.control-section {
  flex: 1;
  min-width: 350px;
  padding: 40px 30px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
}

/* Cards */
.timer-card,
.progress-card,
.questions-card,
.submit-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
  }
}

/* Timer */
.timer-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  
  &.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
  
  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  .timer-text {
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
  }
}

/* Progress */
.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .stat-label {
    color: var(--text-secondary);
  }
  
  .stat-value {
    font-weight: 600;
    color: var(--text-primary);
  }
}

/* Questions Grid */
.questions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.question-dot {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-secondary);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
  
  &.current {
    border-color: #667eea;
    background: #667eea;
    color: white;
  }
  
  &.answered {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  
  &.current.answered {
    background: #10b981;
    color: white;
  }
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #b91c1c;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
  }
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-secondary);
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal */
.finish-modal-content {
  text-align: center;
  
  p {
    margin-bottom: 20px;
    color: var(--text-primary);
  }
}

.answer-summary {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  
  p {
    margin: 8px 0;
    
    strong {
      color: var(--text-primary);
    }
  }
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .exam-split-layout {
    flex-direction: column;
    height: auto;
    max-height: none;
  }
  
  .question-section {
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
  }
  
  .control-section {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: auto;
  }
  
  .timer-card,
  .progress-card,
  .questions-card,
  .submit-card {
    flex: 1;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .modern-exam-container {
    padding: 10px;
  }
  
  .question-section,
  .control-section {
    padding: 20px;
  }
  
  .timer-circle {
    width: 120px;
    height: 120px;
    
    .timer-text {
      font-size: 1.2rem;
    }
  }
  
  .questions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .question-navigation {
    flex-direction: column;
  }
}

/* Dark Mode Adjustments */
[data-theme="dark"] {
  .option-card {
    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    
    &.selected {
      background: rgba(102, 126, 234, 0.2);
    }
  }
  
  .timer-card,
  .progress-card,
  .questions-card,
  .submit-card {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}
</style>