<template>
  <div class="exam-taking-container">
    <div v-if="currentStage === 'intro'" class="exam-intro-stage">
      <div class="intro-container-new">
        <!-- Exam Title -->
        <div class="exam-title-section">
          <h1 class="exam-name">{{ exam.title || 'Exam name' }}</h1>
        </div>

        <!-- Exam Details Grid -->
        <div class="exam-details-grid">
          <div class="detail-item">
            <div class="detail-label">Exam start date</div>
            <div class="detail-value">{{ formatDateTime(exam.startTime) }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Exam finish date</div>
            <div class="detail-value">{{ formatDateTime(exam.endTime) }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">Question length</div>
            <div class="detail-value">{{ exam.questions?.length || 0 }}</div>
          </div>
        </div>

        <!-- Exam Rules -->
        <div class="exam-rules-section">
          <div class="rules-title">Exam rules:</div>
          <div class="rules-content">
            <p>{{ exam.description || 'Please read all instructions carefully before starting the exam. The exam will be automatically submitted when time runs out. You can answer questions in any order and return to previous questions. Do not refresh the page or close the browser during the exam.' }}</p>
          </div>
        </div>

        <!-- Start Button -->
        <div class="start-button-section">
          <button class="start-exam-btn" @click="startExam" :disabled="starting">
            {{ starting ? 'Starting...' : 'Start Exam' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="currentStage === 'questions'" class="exam-questions-stage" style="min-height: 100vh !important; display: flex !important; flex-direction: column !important;">
      <!-- DEBUG: Current Stage = {{ currentStage }} -->
      <!-- Split Layout: Question Left, Timer & Controls Right -->
      <div class="exam-split-container" style="display: flex !important; min-height: 100vh !important; gap: 0 !important; width: 100% !important;">

        <!-- Left Side: Question Content -->
        <div class="question-side" style="flex: 2 !important; padding: 40px !important; background: var(--bg-primary) !important; border-right: 1px solid var(--border-secondary) !important; width: 66.67% !important; position: relative !important; display: flex !important; flex-direction: column !important; justify-content: center !important; min-height: 100vh !important;">
          <!-- Navigation Arrow - Previous -->
          <div class="nav-arrow nav-arrow-left" @click="previousQuestion" 
               :class="{ disabled: currentQuestionIndex === 0 }">
            <span class="material-symbols-outlined">chevron_left</span>
          </div>

          <!-- Question Header -->
          <div class="question-header-main">
            <h2>{{ currentQuestionIndex + 1 }}. Question</h2>
          </div>

          <!-- Question Text -->
          <div class="question-text-main">
            {{ currentQuestion.text }}
          </div>

          <!-- Answer Options -->
          <div class="answer-options">
            <!-- Multiple Choice Options -->
            <div v-if="currentQuestion.type === 'single_choice'" class="options-list">
              <div v-for="(option, index) in currentQuestion.options" :key="index" 
                   class="option-button"
                   :class="{ selected: answers[currentQuestionIndex] === option }" 
                   @click="selectAnswer(option)">
                Option {{ index + 1 }}
              </div>
            </div>

            <!-- Multiple Select Options -->
            <div v-else-if="currentQuestion.type === 'multiple_select'" class="options-list">
              <div v-for="(option, index) in currentQuestion.options" :key="index" 
                   class="option-button"
                   :class="{ selected: isOptionSelected(option) }" 
                   @click="toggleMultipleAnswer(option)">
                Option {{ index + 1 }}
              </div>
            </div>

            <!-- True/False Options -->
            <div v-else-if="currentQuestion.type === 'true_false'" class="options-list">
              <div class="option-button" 
                   :class="{ selected: answers[currentQuestionIndex] === 'true' }"
                   @click="selectAnswer('true')">
                True
              </div>
              <div class="option-button" 
                   :class="{ selected: answers[currentQuestionIndex] === 'false' }"
                   @click="selectAnswer('false')">
                False
              </div>
            </div>

            <!-- Open Ended Answer -->
            <div v-else-if="currentQuestion.type === 'open_ended'" class="open-answer-main">
              <textarea v-model="answers[currentQuestionIndex]" 
                        :placeholder="t('examTaking.enterAnswer')"
                        class="answer-textarea-main" 
                        rows="4"></textarea>
            </div>
          </div>

          <!-- Navigation Arrow - Next -->
          <div class="nav-arrow nav-arrow-right" @click="nextQuestion" 
               :class="{ disabled: currentQuestionIndex >= exam.questions.length - 1 }">
            <span class="material-symbols-outlined">chevron_right</span>
          </div>
        </div>

        <!-- Right Side: Timer & Questions List -->
        <div class="control-side" style="flex: 1 !important; min-width: 350px !important; width: 33.33% !important; background: var(--bg-secondary) !important; padding: 40px 30px !important; display: flex !important; flex-direction: column !important; gap: 40px !important; overflow-y: auto !important; align-items: center !important;">
          <!-- Large Timer -->
          <div class="timer-section-main">
            <div class="timer-circle-large" :class="{ warning: timeWarning, danger: timeDanger }">
              <div class="timer-display-large">{{ formatTime(remainingTime) }}</div>
            </div>
          </div>

          <!-- Questions List -->
          <div class="questions-list-section">
            <h3 class="questions-title">Questions</h3>
            <div class="questions-list">
              <div v-for="(_, index) in exam.questions" :key="index" 
                   class="question-item"
                   :class="{ current: index === currentQuestionIndex }"
                   @click="goToQuestion(index)">
                <span class="question-number">{{ index + 1 }}.Soru</span>
                <span class="question-status">
                  <span v-if="answers[index] !== undefined && answers[index] !== null && answers[index] !== ''" 
                        class="material-symbols-outlined check-icon">check</span>
                  <span v-else class="material-symbols-outlined close-icon">close</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Complete Exam Button -->
          <div class="complete-section">
            <button class="complete-exam-btn" @click="showFinishModal = true">
              Complete Exam
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="currentStage === 'completed'" class="exam-completion-stage">
        <div class="completion-container">
          <div class="completion-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>

          <h1 class="completion-title">{{ t('examTaking.examCompleted') }}</h1>
          <p class="completion-message">{{ t('examTaking.completionMessage') }}</p>

          <div class="completion-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-symbols-outlined">quiz</span>
              </div>
              <div class="stat-content">
                <h3>{{ t('examTaking.questionsAnswered') }}</h3>
                <p>{{ answeredCount }} / {{ exam.questions.length }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-symbols-outlined">schedule</span>
              </div>
              <div class="stat-content">
                <h3>{{ t('examTaking.timeSpent') }}</h3>
                <p>{{ formatTime(timeSpent) }}</p>
              </div>
            </div>
          </div>

          <div class="completion-actions">
            <Button @click="$router.push('/exams')" styleType="primary" size="large"
              :text="t('examTaking.backToExams')" />
          </div>
        </div>
      </div>

    <!-- Finish Confirmation Modal -->
    <Modal v-if="showFinishModal" :modelValue="showFinishModal" @update:modelValue="showFinishModal = $event"
      :title="t('examTaking.confirmFinish')">
        <div class="finish-modal-content">
          <p>{{ t('examTaking.confirmFinishMessage') }}</p>
          <div class="answer-summary">
            <p><strong>{{ t('examTaking.answered') }}:</strong> {{ answeredCount }} / {{ exam.questions.length }}</p>
            <p><strong>{{ t('examTaking.unanswered') }}:</strong> {{ exam.questions.length - answeredCount }}</p>
          </div>
        </div>

        <!-- eslint-disable-next-line vue/valid-template-root -->
        <template v-slot:footer>
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
const starting = ref(false);
const submitting = ref(false);

// Exam stages
const currentStage = ref<'intro' | 'questions' | 'completed'>('intro');

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

// Computed properties
const currentQuestion = computed(() => {
  return exam.value.questions?.[currentQuestionIndex.value] || {};
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

// Methods
const loadExam = async () => {
  try {
    loading.value = true;
    const examId = route.params.id;
    const response = await api.get(`/exam/${examId}`);
    exam.value = response.data;

    // Initialize answers array
    answers.value = new Array(exam.value.questions.length).fill(null);

    // Set timer duration (convert minutes to seconds)
    remainingTime.value = exam.value.duration * 60;
  } catch (error: any) {
    console.error('Error loading exam:', error);
    showError(t('examTaking.loadError'));
    router.push('/exams');
  } finally {
    loading.value = false;
  }
};

const startExam = async () => {
  try {
    starting.value = true;

    // Record exam start
    await api.post(`/exam/${exam.value._id}/start`);

    currentStage.value = 'questions';
    startTime.value = new Date();
    startTimer();
  } catch (error: any) {
    console.error('Error starting exam:', error);
    showError(t('examTaking.startError'));
  } finally {
    starting.value = false;
  }
};

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
      timeSpent.value++;
    } else {
      // Time's up, auto-submit
      finishExam();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const selectAnswer = (answer: string) => {
  answers.value[currentQuestionIndex.value] = answer;
};

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

const isOptionSelected = (option: string) => {
  const currentAnswers = answers.value[currentQuestionIndex.value];
  return Array.isArray(currentAnswers) && currentAnswers.includes(option);
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

const finishExam = async () => {
  try {
    submitting.value = true;
    stopTimer();

    // Submit answers
    await api.post(`/exam/${exam.value._id}/submit`, {
      answers: answers.value,
      timeSpent: timeSpent.value
    });

    showFinishModal.value = false;
    currentStage.value = 'completed';
    showSuccess(t('examTaking.submitSuccess'));
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    showError(t('examTaking.submitError'));
  } finally {
    submitting.value = false;
  }
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

// Question type labels removed - simplified UI

// Lifecycle
onMounted(() => {
  loadExam();
});

onUnmounted(() => {
  stopTimer();
});

// Prevent page refresh/close during exam
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (currentStage.value === 'questions') {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style lang="scss" scoped>
@import "../assets/styles/_framework.scss";

.exam-taking-container {
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* Stage 1: Exam Introduction - New Design */
.exam-intro-stage {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 100vh !important;
  padding: 20px !important;
  background: var(--bg-secondary) !important;
}

.intro-container-new {
  max-width: 600px !important;
  width: 100% !important;
  background: var(--bg-primary) !important;
  border-radius: 12px !important;
  padding: 40px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  position: relative !important;
}

/* Exam Title */
.exam-title-section {
  text-align: center !important;
  margin-bottom: 40px !important;
  
  .exam-name {
    font-size: 1.8rem !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    margin: 0 !important;
  }
}

/* Exam Details Grid */
.exam-details-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 30px 40px !important;
  margin-bottom: 40px !important;
  
  .detail-item {
    .detail-label {
      font-size: 0.95rem !important;
      color: var(--text-secondary) !important;
      margin-bottom: 8px !important;
      font-weight: 500 !important;
    }
    
    .detail-value {
      font-size: 1.1rem !important;
      color: var(--text-primary) !important;
      font-weight: 600 !important;
    }
  }
  
  .detail-item:last-child {
    grid-column: span 2 !important;
    text-align: center !important;
    
    .detail-label {
      text-align: center !important;
    }
    
    .detail-value {
      font-size: 1.3rem !important;
      color: #667eea !important;
    }
  }
}

/* Exam Rules */
.exam-rules-section {
  margin-bottom: 40px !important;
  
  .rules-title {
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    margin-bottom: 15px !important;
  }
  
  .rules-content {
    background: var(--bg-secondary) !important;
    padding: 20px !important;
    border-radius: 8px !important;
    border-left: 4px solid #667eea !important;
    
    p {
      color: var(--text-secondary) !important;
      line-height: 1.6 !important;
      margin: 0 !important;
      font-size: 0.95rem !important;
    }
  }
}

/* Start Button */
.start-button-section {
  text-align: center !important;
  
  .start-exam-btn {
    background: #16a34a !important;
    color: white !important;
    border: none !important;
    border-radius: 25px !important;
    padding: 12px 40px !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    min-width: 200px !important;
    
    &:hover:not(:disabled) {
      background: #15803d !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3) !important;
    }
    
    &:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
    }
  }
}

/* Stage 2: Question Answering */
.exam-questions-stage {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.exam-split-container {
  display: flex !important;
  min-height: 100vh;
  gap: 0;
  width: 100%;
}

/* Left Side - Question Content */
.question-side {
  flex: 2 !important;
  padding: 40px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-secondary);
  overflow-y: auto;
  width: 66.67%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

/* Navigation Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &.nav-arrow-left {
    left: 20px;
  }
  
  &.nav-arrow-right {
    right: 20px;
  }
  
  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-50%) scale(1.1);
  }
  
  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  .material-symbols-outlined {
    font-size: 28px;
    color: #667eea;
  }
}

/* Question Header */
.question-header-main {
  text-align: center;
  margin-bottom: 40px;
  
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

/* Question Text */
.question-text-main {
  font-size: 1.2rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 50px;
  text-align: left;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Answer Options */
.answer-options {
  max-width: 600px;
  margin: 0 auto;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-button {
  padding: 20px 30px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-secondary);
  border-radius: 12px;
  font-size: 1.1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    border-color: #667eea;
    background: var(--bg-primary);
  }
  
  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
}

/* Open Answer */
.open-answer-main {
  .answer-textarea-main {
    width: 100%;
    min-height: 150px;
    padding: 20px;
    border: 2px solid var(--border-secondary);
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}

/* Right Side - Timer & Questions List */
.control-side {
  flex: 1 !important;
  min-width: 350px !important;
  width: 33.33% !important;
  background: var(--bg-secondary);
  padding: 40px 30px;
  display: flex !important;
  flex-direction: column;
  gap: 40px;
  overflow-y: auto;
  align-items: center;
}

/* Large Timer */
.timer-section-main {
  text-align: center;
  
  .timer-circle-large {
    width: 180px !important;
    height: 180px !important;
    border-radius: 50%;
    border: 8px solid var(--border-secondary);
    display: flex !important;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    transition: all 0.3s ease;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    
    &.warning {
      border-color: #f59e0b;
      box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.2);
    }
    
    &.danger {
      border-color: #ef4444;
      animation: pulse 1s infinite;
      box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.2);
    }
    
    .timer-display-large {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      font-family: 'Courier New', monospace;
    }
  }
}

/* Questions List */
.questions-list-section {
  width: 100%;
  
  .questions-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 20px 0;
    text-align: center;
  }
  
  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .question-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: var(--bg-primary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
      
      &.current {
        background: rgba(102, 126, 234, 0.2);
        border: 2px solid #667eea;
      }
      
      .question-number {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .question-status {
        .check-icon {
          color: #10b981;
          font-size: 20px;
        }
        
        .close-icon {
          color: #ef4444;
          font-size: 20px;
        }
      }
    }
  }
}

/* Complete Exam Button */
.complete-section {
  width: 100%;
  margin-top: auto;
  
  .complete-exam-btn {
    width: 100%;
    padding: 15px 30px;
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
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }
  }
}

/* Old timer styles removed - using new large timer */

.exam-progress-info {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;

  .exam-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 15px 0;
    text-align: center;
  }

  .progress-details {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .progress-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .label {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .value {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
      }
    }
  }
}

.question-indicators-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 15px 0;
    text-align: center;
  }

  .question-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    gap: 8px;

    .question-indicator {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid var(--border-secondary);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;

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

      &.answered.current {
        background: #10b981;
        color: white;
      }
    }
  }
}

.navigation-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  margin-top: auto;

  .nav-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.question-container {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  .question-number {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .question-type-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;

    &.single_choice {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
    }

    &.multiple_select {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    &.true_false {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }

    &.open_ended {
      background: rgba(139, 92, 246, 0.1);
      color: #7c3aed;
    }
  }
}

.question-content {
  .question-text {
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.6;
    margin-bottom: 30px;
  }
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 15px;

  &.true-false {
    flex-direction: row;
    gap: 30px;
    justify-content: center;
  }
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 2px solid var(--border-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);

  &:hover {
    border-color: #667eea;
    background: var(--bg-primary);
  }

  &.selected {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  .option-marker {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-primary);
    border: 2px solid var(--border-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text-secondary);
    flex-shrink: 0;

    &.multiple {
      border-radius: 6px;
    }
  }

  &.selected .option-marker {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }

  .option-text {
    flex: 1;
    font-size: 1.1rem;
    color: var(--text-primary);
  }
}

.open-answer {
  .answer-textarea {
    width: 100%;
    min-height: 150px;
    padding: 20px;
    border: 2px solid var(--border-secondary);
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: #667eea;
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}

/* Removed old navigation styles - now handled in .navigation-section */

/* Stage 3: Exam Completion */
.exam-completion-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.completion-container {
  max-width: 600px;
  width: 100%;
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.completion-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;

  .material-symbols-outlined {
    font-size: 50px;
    color: white;
  }
}

.completion-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 15px 0;
}

.completion-message {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 40px 0;
}

.completion-stats {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .stat-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    .material-symbols-outlined {
      font-size: 30px;
      color: white;
    }
  }

  .stat-content {
    text-align: center;

    h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin: 0 0 5px 0;
    }

    p {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
  }
}

/* Modal Styles */
.finish-modal-content {
  text-align: center;

  p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  .answer-summary {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
    text-align: left;

    p {
      margin: 5px 0;
      font-size: 1rem;
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .exam-split-container {
    flex-direction: column;
  }
  
  .question-side {
    flex: none;
    min-height: 60vh;
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
    padding: 30px 20px;
  }
  
  .control-side {
    flex: none;
    min-width: auto;
    padding: 30px 20px;
    gap: 30px;
  }
  
  .nav-arrow {
    display: none;
  }
  
  .timer-circle-large {
    width: 120px !important;
    height: 120px !important;
    
    .timer-display-large {
      font-size: 1.5rem !important;
    }
  }
}

@media (max-width: 768px) {
  .intro-container-new,
  .completion-container {
    padding: 30px 20px;
  }
  
  .exam-details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    
    .detail-item:last-child {
      grid-column: span 1;
    }
  }

  .question-side {
    padding: 20px 15px;
  }
  
  .question-header-main h2 {
    font-size: 1.5rem;
  }
  
  .question-text-main {
    font-size: 1.1rem;
    margin-bottom: 30px;
  }
  
  .option-button {
    padding: 15px 20px;
    font-size: 1rem;
  }

  .control-side {
    padding: 20px 15px;
    gap: 25px;
  }
  
  .timer-circle-large {
    width: 100px !important;
    height: 100px !important;
    
    .timer-display-large {
      font-size: 1.3rem !important;
    }
  }
  
  .questions-title {
    font-size: 1.2rem;
  }

  .completion-stats {
    flex-direction: column;
    gap: 20px;
  }
}

/* Dark mode specific adjustments */
[data-theme="dark"] {
  .timer-circle-large {
    border-color: #4b5563;
    background: var(--bg-primary);

    &.warning {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }

    &.danger {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
  }
  
  .nav-arrow {
    background: rgba(102, 126, 234, 0.15);
    
    &:hover {
      background: rgba(102, 126, 234, 0.25);
    }
  }

  .question-type-badge {
    &.single_choice {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    &.multiple_select {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    &.true_false {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }

    &.open_ended {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
    }
  }

  .option-button {
    background: var(--bg-primary);
    border-color: var(--border-secondary);

    &:hover {
      border-color: #667eea;
      background: var(--bg-secondary);
    }

    &.selected {
      background: rgba(102, 126, 234, 0.15);
      border-color: #667eea;
    }
  }

  .question-indicator {
    background: var(--bg-primary);
    border-color: var(--border-secondary);

    &.answered {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
    }
  }

  .question-container,
  .question-navigation,
  .completion-container {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
}
</style>
