<template>
  <div class="exam-edit-container">
    <div class="page-header">
      <div class="header-content">
        <h1>{{ $t('exam.editExam') }}</h1>
        <p>{{ $t('exam.editExamDescription') }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <span class="material-symbols-outlined">error</span>
      </div>
      <h3>{{ $t('common.error') }}</h3>
      <p>{{ error }}</p>
      <Button @click="loadExam" :text="$t('common.retry')" styleType="primary" />
    </div>

    <div v-else-if="exam" class="exam-edit-form">
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step"
          :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="step-panel">
          <h3>{{ $t('exam.basicInfo') }}</h3>
          <form @submit.prevent="handleStep1Submit">
            <div class="form-group">
              <label for="title">{{ $t('exam.examTitle') }} *</label>
              <Input
                id="title"
                v-model="formData.title"
                :placeholder="$t('exam.titlePlaceholder')"
                :error="errors.title"
              />
            </div>

            <div class="form-group">
              <label for="description">{{ $t('exam.description') }}</label>
              <textarea
                id="description"
                v-model="formData.description"
                :placeholder="$t('exam.descriptionPlaceholder')"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startTime">{{ $t('exam.startTime') }} *</label>
                <Input
                  id="startTime"
                  v-model="formData.startTime"
                  type="datetime-local"
                  :error="errors.startTime"
                />
              </div>

              <div class="form-group">
                <label for="endTime">{{ $t('exam.endTime') }} *</label>
                <Input
                  id="endTime"
                  v-model="formData.endTime"
                  type="datetime-local"
                  :error="errors.endTime"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="duration">{{ $t('exam.duration') }} ({{ $t('common.minutes') }}) *</label>
                <Input
                  id="duration"
                  v-model="formData.duration"
                  type="number"
                  min="1"
                  :placeholder="$t('exam.durationPlaceholder')"
                  :error="errors.duration"
                />
              </div>

              <div class="form-group">
                <label for="questionCount">{{ $t('exam.questionCount') }} *</label>
                <Input
                  id="questionCount"
                  v-model="formData.questionCount"
                  type="number"
                  min="1"
                  :placeholder="$t('exam.questionCountPlaceholder')"
                  :error="errors.questionCount"
                />
              </div>
            </div>

            <div class="step-actions">
              <Button
                type="button"
                @click="$router.push('/exams')"
                :text="$t('common.cancel')"
                styleType="secondary"
              />
              <Button
                type="submit"
                :text="$t('common.next')"
                styleType="primary"
              />
            </div>
          </form>
        </div>

        <!-- Step 2: Questions -->
        <div v-if="currentStep === 2" class="step-panel">
          <h3>{{ $t('exam.questions') }}</h3>
          <div class="questions-section">
            <div class="section-header">
              <h4>{{ $t('exam.selectQuestions') }}</h4>
              <div class="search-filters">
                <Input
                  v-model="questionSearch"
                  :placeholder="$t('exam.searchQuestions')"
                  icon="search"
                  class="search-input"
                />
                <Select
                  v-model="questionTypeFilter"
                  :options="questionTypeOptions"
                  :placeholder="$t('exam.allTypes')"
                  class="filter-select"
                />
                <Select
                  v-model="difficultyFilter"
                  :options="difficultyOptions"
                  :placeholder="$t('exam.allDifficulties')"
                  class="filter-select"
                />
              </div>
            </div>

            <div v-if="loadingQuestions" class="loading-state">
              <div class="spinner"></div>
              <p>{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="errorQuestions" class="error-state">
              <p>{{ errorQuestions }}</p>
            </div>

            <div v-else class="questions-list">
              <div class="questions-table">
                <table class="selection-table">
                  <thead>
                    <tr>
                      <th class="select-column">
                        <input type="checkbox" @change="toggleAllQuestions" :checked="allQuestionsSelected" />
                      </th>
                      <th>{{ $t('exam.questionText') }}</th>
                      <th>{{ $t('exam.type') }}</th>
                      <th>{{ $t('exam.difficulty') }}</th>
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
                          />
                        </div>
                      </td>
                      <td class="question-text">{{ question.text }}</td>
                      <td class="question-type">
                        <StatusBadge :status="question.type" type="question" />
                      </td>
                      <td class="question-difficulty">
                        <StatusBadge :status="question.difficulty" type="question" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="step-actions">
              <Button
                type="button"
                @click="previousStep"
                :text="$t('common.previous')"
                styleType="secondary"
              />
              <Button
                type="button"
                @click="nextStep"
                :text="$t('common.next')"
                styleType="primary"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Students -->
        <div v-if="currentStep === 3" class="step-panel">
          <h3>{{ $t('exam.students') }}</h3>
          <div class="students-section">
            <div class="section-header">
              <h4>{{ $t('exam.selectStudents') }}</h4>
              <div class="search-filters">
                <Input
                  v-model="studentSearch"
                  :placeholder="$t('exam.searchStudents')"
                  icon="search"
                  class="search-input"
                />
              </div>
            </div>

            <div v-if="loadingStudents" class="loading-state">
              <div class="spinner"></div>
              <p>{{ $t('common.loading') }}</p>
            </div>

            <div v-else-if="errorStudents" class="error-state">
              <p>{{ errorStudents }}</p>
            </div>

            <div v-else class="students-list">
              <div class="students-table">
                <table class="selection-table">
                  <thead>
                    <tr>
                      <th class="select-column">
                        <input type="checkbox" @change="toggleAllStudents" :checked="allStudentsSelected" />
                      </th>
                      <th>{{ $t('exam.studentName') }}</th>
                      <th>{{ $t('exam.email') }}</th>
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

            <div class="step-actions">
              <Button
                type="button"
                @click="previousStep"
                :text="$t('common.previous')"
                styleType="secondary"
              />
              <Button
                type="button"
                @click="finishExamUpdate"
                :text="$t('common.save')"
                styleType="primary"
                :loading="saving"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';
import Button from '../components/ui/Button.vue';
import Input from '../components/ui/Input.vue';
import Select from '../components/ui/Select.vue';
import StatusBadge from '../components/ui/StatusBadge.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { showSuccess, showError } = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const saving = ref(false);
const error = ref('');
const exam = ref(null);

// Step management
const currentStep = ref(1);
const steps = computed(() => [
  t('exam.stepBasicInfo'),
  t('exam.stepQuestions'),
  t('exam.stepStudents')
]);

// Form data
const formData = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  duration: 60,
  questionCount: 0
});

const errors = ref({});

// Questions
const questions = ref([]);
const selectedQuestions = ref([]);
const loadingQuestions = ref(false);
const errorQuestions = ref('');
const questionSearch = ref('');
const questionTypeFilter = ref('');
const difficultyFilter = ref('');

// Students
const students = ref([]);
const selectedStudents = ref([]);
const loadingStudents = ref(false);
const errorStudents = ref('');
const studentSearch = ref('');

// Question type options
const questionTypeOptions = computed(() => [
  { value: '', label: t('exam.allTypes') },
  { value: 'single_choice', label: t('questionBank.singleChoice') },
  { value: 'multiple_select', label: t('questionBank.multipleSelect') },
  { value: 'true_false', label: t('questionBank.trueFalse') },
  { value: 'open_ended', label: t('questionBank.openEnded') }
]);

// Difficulty options
const difficultyOptions = computed(() => [
  { value: '', label: t('exam.allDifficulties') },
  { value: 'easy', label: t('questionBank.easy') },
  { value: 'medium', label: t('questionBank.medium') },
  { value: 'hard', label: t('questionBank.hard') }
]);

// Computed properties
const filteredQuestions = computed(() => {
  let filtered = questions.value;
  
  if (questionSearch.value) {
    filtered = filtered.filter(q => 
      q.text.toLowerCase().includes(questionSearch.value.toLowerCase())
    );
  }
  
  if (questionTypeFilter.value) {
    filtered = filtered.filter(q => q.type === questionTypeFilter.value);
  }
  
  if (difficultyFilter.value) {
    filtered = filtered.filter(q => q.difficulty === difficultyFilter.value);
  }
  
  return filtered;
});

const filteredStudents = computed(() => {
  let filtered = students.value;
  
  if (studentSearch.value) {
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(studentSearch.value.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.value.toLowerCase())
    );
  }
  
  return filtered;
});

const allQuestionsSelected = computed(() => {
  return filteredQuestions.value.length > 0 && 
         filteredQuestions.value.every(q => selectedQuestions.value.includes(q._id));
});

const allStudentsSelected = computed(() => {
  return filteredStudents.value.length > 0 && 
         filteredStudents.value.every(s => selectedStudents.value.includes(s._id));
});

const loadExam = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await api.get(`/exams/${route.params.id}`);
    exam.value = response.data;
    
    // Form verilerini doldur
    formData.value = {
      title: exam.value.title || '',
      description: exam.value.description || '',
      startTime: formatDateTimeLocal(exam.value.startTime),
      endTime: formatDateTimeLocal(exam.value.endTime),
      duration: exam.value.duration || 60,
      questionCount: exam.value.questionCount || 0
    };

    // Mevcut soruları ve öğrencileri yükle
    selectedQuestions.value = exam.value.questions?.map(q => q._id) || [];
    selectedStudents.value = exam.value.assignedStudents?.map(s => s._id) || [];
  } catch (err) {
    console.error('Load exam error:', err);
    error.value = err.response?.data?.message || t('exam.loadError');
  } finally {
    loading.value = false;
  }
};

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const validateForm = () => {
  errors.value = {};
  
  if (!formData.value.title.trim()) {
    errors.value.title = t('validation.required', { field: t('exam.title') });
  }
  
  if (!formData.value.startTime) {
    errors.value.startTime = t('validation.required', { field: t('exam.startTime') });
  }
  
  if (!formData.value.endTime) {
    errors.value.endTime = t('validation.required', { field: t('exam.endTime') });
  }
  
  if (formData.value.startTime && formData.value.endTime) {
    const startTime = new Date(formData.value.startTime);
    const endTime = new Date(formData.value.endTime);
    
    if (endTime <= startTime) {
      errors.value.endTime = t('exam.endTimeAfterStartTime');
    }
  }
  
  if (!formData.value.duration || formData.value.duration < 1) {
    errors.value.duration = t('validation.required', { field: t('exam.duration') });
  }
  
  if (!formData.value.questionCount || formData.value.questionCount < 1) {
    errors.value.questionCount = t('validation.required', { field: t('exam.questionCount') });
  }
  
  return Object.keys(errors.value).length === 0;
};

// Step navigation
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
    if (currentStep.value === 2) {
      loadQuestions();
    } else if (currentStep.value === 3) {
      loadStudents();
    }
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Step 1: Basic info validation and navigation
const handleStep1Submit = () => {
  if (!validateForm()) {
    return;
  }
  nextStep();
};

// Load questions
const loadQuestions = async () => {
  loadingQuestions.value = true;
  errorQuestions.value = '';
  try {
    const response = await api.get('/questions');
    questions.value = response.data;
  } catch (error) {
    errorQuestions.value = t('exam.questionsLoadError');
  } finally {
    loadingQuestions.value = false;
  }
};

// Load students
const loadStudents = async () => {
  loadingStudents.value = true;
  errorStudents.value = '';
  try {
    if (authStore.user?.role === 'admin') {
      const response = await api.get('/auth/admin/users');
      students.value = response.data.filter((user) => user.role === 'student');
    } else if (authStore.user?.role === 'teacher') {
      const response = await api.get(`/teachers/${authStore.user._id}/students`);
      students.value = response.data;
    } else {
      students.value = [];
    }
  } catch (error) {
    errorStudents.value = t('exam.studentsLoadError');
  } finally {
    loadingStudents.value = false;
  }
};

// Question selection
const toggleQuestion = (questionId) => {
  const index = selectedQuestions.value.indexOf(questionId);
  if (index > -1) {
    selectedQuestions.value.splice(index, 1);
  } else {
    if (selectedQuestions.value.length < formData.value.questionCount) {
      selectedQuestions.value.push(questionId);
    } else {
      showError(t('exam.maxQuestionsError', { count: formData.value.questionCount }));
    }
  }
};

const toggleAllQuestions = () => {
  if (allQuestionsSelected.value) {
    selectedQuestions.value = selectedQuestions.value.filter(
      id => !filteredQuestions.value.some(q => q._id === id)
    );
  } else {
    const newSelections = filteredQuestions.value
      .filter(q => !selectedQuestions.value.includes(q._id))
      .map(q => q._id);
    
    if (selectedQuestions.value.length + newSelections.length <= formData.value.questionCount) {
      selectedQuestions.value.push(...newSelections);
    } else {
      showError(t('exam.maxQuestionsError', { count: formData.value.questionCount }));
    }
  }
};

// Student selection
const toggleStudent = (studentId) => {
  const index = selectedStudents.value.indexOf(studentId);
  if (index > -1) {
    selectedStudents.value.splice(index, 1);
  } else {
    selectedStudents.value.push(studentId);
  }
};

const toggleAllStudents = () => {
  if (allStudentsSelected.value) {
    selectedStudents.value = selectedStudents.value.filter(
      id => !filteredStudents.value.some(s => s._id === id)
    );
  } else {
    const newSelections = filteredStudents.value
      .filter(s => !selectedStudents.value.includes(s._id))
      .map(s => s._id);
    selectedStudents.value.push(...newSelections);
  }
};

// Finish exam update
const finishExamUpdate = async () => {
  saving.value = true;
  try {
    // Update basic info
    const updateData = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      duration: parseInt(formData.value.duration),
      questionCount: parseInt(formData.value.questionCount)
    };
    
    await api.put(`/exams/${route.params.id}`, updateData);

    // Update questions
    if (selectedQuestions.value.length > 0) {
      await api.post(`/exams/${route.params.id}/add-questions`, {
        questionIds: selectedQuestions.value
      });
    }

    // Update students
    if (selectedStudents.value.length > 0) {
      await api.post(`/exams/${route.params.id}/assign-students`, {
        studentIds: selectedStudents.value
      });
    }

    showSuccess(t('exam.updateSuccess'));
    router.push('/exams');
  } catch (error) {
    console.error('Update exam error:', error);
    showError(error.response?.data?.message || t('exam.updateError'));
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadExam();
});
</script>

<style scoped lang="scss">
.exam-edit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.exam-edit-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0 12px;
}

.step-indicator {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.step {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
  background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.5;
  border-radius: 8px;
  
  
  
  &.active {
    background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
  }
  
  &.completed {
    background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.8;
    color: white;
    
  }
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
}

.step-label {
  font-weight: 500;
  font-size: 14px;
}

.step-content {
  margin: 20px 0;
}

.step-panel h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.step-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
}

.questions-section, .students-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }
  }
  
  .search-filters {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .search-input {
    width: 200px;
  }
  
  .filter-select {
    width: 150px;
  }
}

.selection-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
  }
  
  .select-column {
    width: 50px;
    text-align: center;
  }
  
  .question-row, .student-row {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background: #f9fafb;
    }
    
    &.selected {
      background: #eff6ff;
    }
  }
  
  .question-checkbox, .student-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #3b82f6;
    }
  }
  
  .question-text, .student-name {
    font-weight: 500;
    color: #1f2937;
  }
  
  .question-type, .question-difficulty {
    text-align: center;
  }
  
  .student-email {
    color: #6b7280;
    font-size: 14px;
  }
}

.page-header {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.header-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  width: 64px;
  height: 64px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.error-icon .material-symbols-outlined {
  font-size: 32px;
  color: #ef4444;
}

.exam-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
</style>
