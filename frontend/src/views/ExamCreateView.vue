<template>
  <div class="exam-create-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">{{ $t('examCreate.title') }}</h1>
          <p class="page-subtitle">{{ $t('examCreate.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key, disabled: tab.disabled }"
          :disabled="tab.disabled"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Basic Information Tab -->
      <div v-show="activeTab === 'info'" class="tab-panel">
        <div class="info-section">
          <h3>{{ $t('examCreate.examInfo') }}</h3>
          <form @submit.prevent="handleStep1Submit" class="exam-form">
            <div class="form-group">
              <label>{{ $t('examCreate.examName') }} *</label>
              <input 
                v-model="examData.title" 
                type="text" 
                :placeholder="$t('examCreate.examNamePlaceholder')"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>{{ $t('examCreate.description') }}</label>
              <textarea 
                v-model="examData.description" 
                :placeholder="$t('examCreate.descriptionPlaceholder')"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ $t('examCreate.startTime') }} *</label>
                <input 
                  v-model="examData.startTime" 
                  type="datetime-local"
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label>{{ $t('examCreate.endTime') }} *</label>
                <input 
                  v-model="examData.endTime" 
                  type="datetime-local"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ $t('examCreate.duration') }} *</label>
                <input 
                  v-model="examData.duration" 
                  type="number"
                  min="1"
                  :placeholder="$t('examCreate.durationPlaceholder')"
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label>{{ $t('examCreate.questionCount') }} *</label>
                <input 
                  v-model="examData.questionCount" 
                  type="number"
                  min="1"
                  :placeholder="$t('examCreate.questionCountPlaceholder')"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-actions">
              <Button 
                type="button"
                @click="$router.push('/exams')"
                :text="$t('common.cancel')"
                styleType="secondary"
              />
              <Button 
                type="submit" 
                :text="$t('examCreate.saveAndContinue')" 
                styleType="primary" 
                :loading="loading"
              />
            </div>
          </form>
        </div>
      </div>

      <!-- Questions Tab -->
      <div v-show="activeTab === 'questions'" class="tab-panel">
        <div class="questions-section">
          <h3>{{ $t('examCreate.questionSelection') }}</h3>
          <div v-if="loadingQuestions" class="loading">{{ $t('examCreate.loadingQuestions') }}</div>
          <div v-else-if="errorQuestions" class="error">{{ errorQuestions }}</div>
          <div v-else>
            <div v-if="questions.length === 0" class="empty-state">
              <Empty 
                icon="quiz"
                :title="$t('examCreate.noQuestions')"
                :description="$t('examCreate.noQuestionsDesc')"
                :show-action="false"
              />
            </div>
            <div v-else>
              <!-- Search and Filter -->
              <div class="search-filter-bar">
                <div class="search-box">
                  <input 
                    v-model="questionSearch" 
                    type="text" 
                    :placeholder="$t('examCreate.searchQuestions')"
                    class="search-input"
                  />
                  <span class="material-symbols-outlined search-icon">search</span>
                </div>
                <div class="filter-group">
                  <select v-model="questionTypeFilter" class="filter-select">
                    <option value="">{{ $t('examCreate.allTypes') }}</option>
                    <option value="multiple-choice">{{ $t('questionBank.multipleChoice') }}</option>
                    <option value="true-false">{{ $t('questionBank.trueFalse') }}</option>
                    <option value="short-answer">{{ $t('questionBank.shortAnswer') }}</option>
                  </select>
                  <select v-model="difficultyFilter" class="filter-select">
                    <option value="">{{ $t('examCreate.allDifficulties') }}</option>
                    <option value="easy">{{ $t('questionBank.easy') }}</option>
                    <option value="medium">{{ $t('questionBank.medium') }}</option>
                    <option value="hard">{{ $t('questionBank.hard') }}</option>
                  </select>
                </div>
              </div>
              
              <!-- Question Count Info -->
              <div class="question-count-info">
                <span class="selected-count">{{ selectedQuestions.length }} / {{ examData.questionCount }} {{ $t('examCreate.questionsSelected') }}</span>
                <span v-if="selectedQuestions.length > examData.questionCount" class="count-warning">
                  {{ $t('examCreate.maxQuestionsWarning', { count: examData.questionCount }) }}
                </span>
              </div>
            
              <div class="questions-table">
                <table class="selection-table">
                  <thead>
                    <tr>
                      <th class="select-column"></th>
                      <th>{{ $t('examCreate.questionText') }}</th>
                      <th>{{ $t('examCreate.type') }}</th>
                      <th>{{ $t('examCreate.difficulty') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="question in filteredQuestions" 
                      :key="question._id"
                      class="question-row"
                      :class="{ selected: selectedQuestions.includes(question._id) }"
                    >
                      <td class="select-column">
                        <div class="question-checkbox" @click.stop>
                          <input 
                            type="checkbox" 
                            :checked="selectedQuestions.includes(question._id)"
                            @change="toggleQuestion(question._id)"
                            @click.stop
                          />
                        </div>
                      </td>
                      <td class="question-text">
                        <h4>{{ question.text }}</h4>
                      </td>
                      <td class="question-type">
                        <span class="type-badge">{{ getQuestionTypeText(question.type) }}</span>
                      </td>
                      <td class="question-difficulty">
                        <span class="difficulty-badge" :class="question.difficulty">{{ question.difficulty }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <Button 
            @click="activeTab = 'info'" 
            styleType="secondary" 
            size="medium" 
            :text="$t('common.previous')"
          />
          <Button 
            @click="goToStudentsTab" 
            styleType="primary" 
            size="medium" 
            :text="$t('common.next')"
            :disabled="selectedQuestions.length !== examData.questionCount"
          />
        </div>
      </div>

      <!-- Students Tab -->
      <div v-show="activeTab === 'students'" class="tab-panel">
        <div class="students-section">
          <h3>{{ $t('examCreate.stepStudentAssignment') }}</h3>
          <div v-if="loadingStudents" class="loading">{{ $t('examCreate.loadingStudents') }}</div>
          <div v-else-if="errorStudents" class="error">{{ errorStudents }}</div>
          <div v-else>
            <div v-if="students.length === 0" class="empty-state">
              <Empty 
                icon="group"
                :title="$t('examCreate.noStudents')"
                :description="$t('examCreate.noStudentsDesc')"
                :show-action="false"
              />
            </div>
            <div v-else>
              <!-- Search -->
              <div class="search-filter-bar">
                <div class="search-box">
                  <input 
                    v-model="studentSearch" 
                    type="text" 
                    :placeholder="$t('examCreate.searchStudents')"
                    class="search-input"
                  />
                  <span class="material-symbols-outlined search-icon">search</span>
                </div>
              </div>
              
              <!-- Selected Count Info -->
              <div class="selected-count-info">
                <span class="selected-count">{{ selectedStudents.length }} {{ $t('examCreate.studentsSelected') }}</span>
              </div>
              
              <!-- Students Table -->
              <div class="students-table">
                <table class="selection-table">
                  <thead>
                    <tr>
                      <th class="select-column">
                        <input type="checkbox" @change="toggleAllStudents" :checked="allStudentsSelected" />
                      </th>
                      <th>{{ $t('examCreate.studentName') }}</th>
                      <th>{{ $t('examCreate.studentEmail') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="student in filteredStudents" 
                      :key="student._id"
                      class="student-row"
                      :class="{ selected: selectedStudents.includes(student._id) }"
                    >
                      <td class="select-column">
                        <div class="student-checkbox" @click.stop>
                          <input 
                            type="checkbox" 
                            :checked="selectedStudents.includes(student._id)"
                            @change="toggleStudent(student._id)"
                          />
                        </div>
                      </td>
                      <td class="student-name">{{ student.name }}</td>
                      <td class="student-email">{{ student.email }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <Button 
            @click="activeTab = 'questions'" 
            styleType="secondary" 
            size="medium" 
            :text="$t('common.previous')"
          />
          <Button 
            @click="finishExamCreation" 
            styleType="primary" 
            size="medium" 
            :text="$t('examCreate.createExam')"
            :loading="creatingExam"
            :disabled="selectedStudents.length === 0"
          />
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import Button from '../components/ui/Button.vue';
import Empty from '../components/ui/Empty.vue';
import DataTable from '../components/ui/DataTable.vue';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';

const { t } = useI18n();
const router = useRouter();
const { showSuccess, showError } = useToast();
const authStore = useAuthStore();

// Tab management
const activeTab = ref('info');
const tabs = computed(() => [
  {
    key: 'info',
    label: t('examCreate.stepExamInfo'),
    icon: 'info',
    disabled: false
  },
  {
    key: 'questions',
    label: t('examCreate.stepQuestionSelection'),
    icon: 'quiz',
    disabled: !examCreated.value
  },
  {
    key: 'students',
    label: t('examCreate.stepStudentAssignment'),
    icon: 'group',
    disabled: !examCreated.value || selectedQuestions.value.length === 0
  }
]);

const examCreated = ref(false);
const loading = ref(false);
const saving = ref(false);
const creatingExam = ref(false);

// Exam data
const examData = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  duration: 60,
  questionCount: 10
});

// Questions
const questions = ref<any[]>([]);
const selectedQuestions = ref<string[]>([]);
const loadingQuestions = ref(false);
const errorQuestions = ref('');

// Students
const students = ref<any[]>([]);
const selectedStudents = ref<string[]>([]);
const loadingStudents = ref(false);
const errorStudents = ref('');

// Search and filter
const questionSearch = ref('');
const questionTypeFilter = ref('');
const difficultyFilter = ref('');
const studentSearch = ref('');

// Table columns
const questionColumns = [
  { key: 'select', label: '', sortable: false, width: '50px' },
  { key: 'text', label: t('questionBank.questionText'), sortable: true },
  { key: 'type', label: t('questionBank.type'), sortable: true, width: '120px' },
  { key: 'difficulty', label: t('questionBank.difficulty'), sortable: true, width: '100px' }
];

const studentColumns = [
  { key: 'select', label: '', sortable: false, width: '50px' },
  { key: 'name', label: t('common.fullName'), sortable: true },
  { key: 'email', label: t('common.email'), sortable: true }
];

// Initialize form with default values
const initializeForm = () => {
  const now = new Date();
  const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  examData.value.startTime = formatDateTimeLocal(startTime);
  examData.value.endTime = formatDateTimeLocal(endTime);
};

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getQuestionTypeText = (type: string) => {
  const types: Record<string, string> = {
    'multiple-choice': 'Çoktan Seçmeli',
    'true-false': 'Doğru/Yanlış',
    'short-answer': 'Kısa Cevap'
  };
  return types[type] || type;
};

// Filtered questions
const filteredQuestions = computed(() => {
  return questions.value.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(questionSearch.value.toLowerCase());
    const matchesType = !questionTypeFilter.value || question.type === questionTypeFilter.value;
    const matchesDifficulty = !difficultyFilter.value || question.difficulty === difficultyFilter.value;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });
});

// Filtered students
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearch.value.toLowerCase()) ||
                         student.email.toLowerCase().includes(studentSearch.value.toLowerCase());
    return matchesSearch;
  });
});

// Step 1: Validate and proceed (don't save yet)
const handleStep1Submit = async () => {
  if (!examData.value.title || !examData.value.startTime || !examData.value.endTime || !examData.value.duration || !examData.value.questionCount) {
    showError(t('examCreate.validation.allFieldsRequired'));
    return;
  }

  // Validate start and end times
  const startTime = new Date(examData.value.startTime);
  const endTime = new Date(examData.value.endTime);
  
  if (endTime <= startTime) {
    showError(t('examCreate.validation.endTimeAfterStart'));
    return;
  }

  // Don't save the exam yet, just proceed to next step
  loading.value = true;
  try {
    // Just move to next tab and load questions
    activeTab.value = 'questions';
    loadQuestions();
  } catch (error: any) {
    console.error('Step 1 error:', error);
    showError(t('common.error'));
  } finally {
    loading.value = false;
  }
};

// Step 2: Load questions
const loadQuestions = async () => {
  loadingQuestions.value = true;
  errorQuestions.value = '';
  try {
    const response = await api.get('/questions');
    questions.value = response.data;
  } catch (error: any) {
    errorQuestions.value = 'Sorular yüklenirken bir hata oluştu';
  } finally {
    loadingQuestions.value = false;
  }
};

const toggleQuestion = (questionId: string) => {
  const index = selectedQuestions.value.indexOf(questionId);
  if (index > -1) {
    selectedQuestions.value.splice(index, 1);
  } else {
    // Check if we can add more questions
    if (selectedQuestions.value.length < examData.value.questionCount) {
      selectedQuestions.value.push(questionId);
    } else {
      showError(`Maksimum ${examData.value.questionCount} soru seçebilirsiniz`);
    }
  }
};

// Question selection validation for tab navigation
const validateQuestionSelection = () => {
  if (selectedQuestions.value.length === 0) {
    showError(t('examCreate.validation.selectQuestions'));
    return false;
  }
  if (selectedQuestions.value.length !== examData.value.questionCount) {
    showError(t('examCreate.validation.exactQuestionCount', { count: examData.value.questionCount }));
    return false;
  }
  return true;
};

// Navigate to students tab with validation
const goToStudentsTab = () => {
  if (validateQuestionSelection()) {
    activeTab.value = 'students';
    loadStudents();
  }
};

// Step 3: Load students
const loadStudents = async () => {
  loadingStudents.value = true;
  errorStudents.value = '';
  try {
    if (authStore.user?.role === 'admin') {
      // Admin can see all students
      const response = await api.get('/auth/admin/users');
      students.value = response.data.filter((user: any) => user.role === 'student');
    } else if (authStore.user?.role === 'teacher') {
      // Teacher can only see assigned students
      const response = await api.get(`/teachers/${authStore.user._id}/students`);
      students.value = response.data;
    } else {
      students.value = [];
    }
  } catch (error: any) {
    errorStudents.value = 'Öğrenciler yüklenirken bir hata oluştu';
  } finally {
    loadingStudents.value = false;
  }
};

const toggleStudent = (studentId: string) => {
  const index = selectedStudents.value.indexOf(studentId);
  if (index > -1) {
    selectedStudents.value.splice(index, 1);
  } else {
    selectedStudents.value.push(studentId);
  }
};

// Finish exam creation
const finishExamCreation = async () => {
  // Final validation before creating exam
  if (selectedQuestions.value.length !== examData.value.questionCount) {
    showError(`Tam olarak ${examData.value.questionCount} soru seçilmelidir`);
    return;
  }

  if (selectedStudents.value.length === 0) {
    showError('En az bir öğrenci seçilmelidir');
    return;
  }

  creatingExam.value = true;
  try {
    console.log('Creating exam with complete data...');
    console.log('Exam data:', examData.value);
    console.log('Selected questions:', selectedQuestions.value);
    console.log('Selected students:', selectedStudents.value);
    
    // Step 1: Create the exam with basic info
    const examResponse = await api.post('/exams', {
      title: examData.value.title,
      description: examData.value.description,
      startTime: examData.value.startTime,
      endTime: examData.value.endTime,
      duration: examData.value.duration,
      questionCount: examData.value.questionCount
    });

    const examId = examResponse.data._id;
    console.log('Exam created with ID:', examId);

    // Step 2: Add questions to exam
    if (selectedQuestions.value.length > 0) {
      console.log('Adding questions to exam...');
      await api.post(`/exams/${examId}/add-questions`, {
        questionIds: selectedQuestions.value
      });
    }

    // Step 3: Assign students to exam
    if (selectedStudents.value.length > 0) {
      console.log('Assigning students to exam...');
      await api.post(`/exams/${examId}/assign-students`, {
        studentIds: selectedStudents.value
      });
    }

    showSuccess('Sınav başarıyla oluşturuldu!');
    router.push('/exams');
  } catch (error: any) {
    console.error('Finish exam creation error:', error);
    showError(error.response?.data?.message || 'Sınav oluşturulurken bir hata oluştu');
  } finally {
    creatingExam.value = false;
  }
};

onMounted(() => {
  initializeForm();
});
</script>

<style scoped lang="scss">
.exam-create-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.page-header {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.tab-navigation {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.tab-nav {
  display: flex;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
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
    font-size: 20px;
  }
}

.tab-content {
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.tab-panel {
  padding: 32px;
}

.info-section, .questions-section, .students-section {
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 24px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-secondary);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 14px;
  }

  input, textarea, select {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      outline: none;
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  textarea {
    height: auto !important;
    min-height: 80px;
    padding: 12px !important;
    resize: vertical;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  
  &.full-width {
    grid-column: 1 / -1; /* Span across all columns */
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border-secondary);
}
.exam-create-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  
  .header-content {
    h1 {
      color: var(--text-primary);
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.8;
    }
  }
}

.step-indicator-container {
  margin-bottom: 40px;
  padding: 0 20px;
}

.step-indicator {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  padding: 20px 10px;
  transition: all 0.3s ease;
  
  &.active {
    .step-circle {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .step-title {
      color: var(--text-primary);
      font-weight: 600;
    }
    
    .step-description {
      color: var(--text-secondary);
    }
  }
  
  &.completed {
    .step-circle {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    
    .step-title {
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .step-description {
      color: var(--text-secondary);
    }
    
    .check-icon {
      font-size: 18px;
      font-weight: bold;
    }
  }
  
  &:not(.active):not(.completed) {
    opacity: 0.6;
    
    .step-circle {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 2px solid var(--border-secondary);
    }
    
    .step-title {
      color: var(--text-tertiary);
    }
    
    .step-description {
      color: var(--text-tertiary);
    }
  }
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.step-content {
  text-align: center;
  
  .step-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    transition: all 0.3s ease;
  }
  
  .step-description {
    font-size: 12px;
    opacity: 0.8;
    transition: all 0.3s ease;
  }
}

.step-connector {
  position: absolute;
  top: 45px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: var(--border-secondary);
  transition: all 0.3s ease;
  z-index: 1;
  
  &.completed {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  }
}

.step-content {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 30px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  
  h3 {
    color: var(--text-primary);
    margin: 0 0 20px 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
}


.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.error {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
}

.empty-state {
  padding: 20px;
}

.search-filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 20px;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  option {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
}

.question-count-info, .student-count-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-primary);
}

.selected-count {
  font-weight: 500;
  color: var(--text-primary);
}

.count-warning {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
}

.questions-list, .students-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
}

/* Selection Tables */
.questions-table, .students-table {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.selection-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.selection-table th {
  background: var(--bg-secondary);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: all 0.3s ease;
}

.selection-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-primary);
  vertical-align: middle;
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.question-row, .student-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.question-row:hover, .student-row:hover {
  background: var(--bg-secondary);
}

.question-row.selected, .student-row.selected {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
}

.select-column {
  width: 50px;
  text-align: center;
}

/* DataTable custom styles for exam creation */
.question-checkbox, .student-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.question-checkbox input, .student-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.question-checkbox, .student-checkbox {
  cursor: pointer;
}

.question-text h4, .student-name h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.student-email p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.type-badge, .difficulty-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
}


.difficulty-badge {
  &.easy {
    background: #dcfce7;
    color: #166534;
  }
  &.medium {
    background: #fef3c7;
    color: #92400e;
  }
  &.hard {
    background: #fee2e2;
    color: #991b1b;
  }
}

.question-item, .student-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
  }

  &.selected {
    background: rgba(102, 126, 234, 0.1);
    border-color: #667eea;
  }

  &:last-child {
    border-bottom: none;
  }
}

.question-checkbox, .student-checkbox {
  margin-right: 12px;
}

.question-content, .student-content {
  flex: 1;
}

.question-content h4, .student-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--text-primary);
}

.question-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.question-type, .question-difficulty {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.student-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .step-indicator {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .exam-create-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 30px 20px;
    margin-bottom: 30px;
    
    .header-content h1 {
      font-size: 2rem;
    }
    
    .header-content p {
      font-size: 1rem;
    }
  }
  
  .step-indicator-container {
    padding: 0 10px;
    margin-bottom: 30px;
  }
  
  .step-indicator {
    flex-direction: column;
    gap: 20px;
    max-width: none;
  }
  
  .step-item {
    flex-direction: row;
    text-align: left;
    padding: 15px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-primary);
    
    .step-circle {
      margin-bottom: 0;
      margin-right: 15px;
      width: 40px;
      height: 40px;
      font-size: 14px;
    }
    
    .step-content {
      text-align: left;
      flex: 1;
      
      .step-title {
        font-size: 16px;
        margin-bottom: 2px;
      }
      
      .step-description {
        font-size: 13px;
      }
    }
  }
  
  .step-connector {
    display: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-card {
    padding: 20px;
    border-radius: 10px;
    
    h3 {
      font-size: 1.3rem;
    }
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
    
    .btn {
      width: 100%;
    }
  }
}
</style>