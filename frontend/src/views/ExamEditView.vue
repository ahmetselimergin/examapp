<template>
  <div class="exam-edit-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">{{ $t('examEdit.title') }}</h1>
          <p class="page-subtitle">{{ $t('examEdit.subtitle') }}</p>
        </div>
        <div class="header-right" v-if="exam">
          <div class="exam-status-badge" :class="getExamStatus(exam)">
            <span class="material-symbols-outlined">{{ getStatusIcon(exam) }}</span>
            {{ getExamStatusText(exam) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <span class="material-symbols-outlined">error</span>
      </div>
      <h3>{{ $t('common.error') }}</h3>
      <p>{{ error }}</p>
      <Button @click="loadExam" :text="$t('common.retry')" styleType="primary" />
    </div>

    <!-- Tab Navigation -->
    <div v-else-if="exam" class="exam-edit-form">
      <div class="tab-navigation">
        <nav class="tab-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
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
            <h3>{{ t('examEdit.basicInfo') }}</h3>
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
                  <label for="questionCount">{{ $t('examCreate.questionCount') }} *</label>
                  <Input
                    id="questionCount"
                    v-model="formData.questionCount"
                    type="number"
                    min="1"
                    max="100"
                    :placeholder="$t('examCreate.questionCountPlaceholder')"
                    :error="errors.questionCount"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="attemptLimit">{{ $t('examCreate.attemptLimit') }} *</label>
                  <Input
                    id="attemptLimit"
                    v-model="formData.attemptLimit"
                    type="number"
                    min="1"
                    max="10"
                    :placeholder="$t('examCreate.attemptLimitPlaceholder')"
                    :error="errors.attemptLimit"
                  />
                </div>
              </div>

              <div class="form-actions">
                <Button 
                  type="submit" 
                  :text="t('examEdit.saveBasicInfo')" 
                  styleType="primary" 
                  :loading="updating"
                />
              </div>
            </form>
          </div>
        </div>

        <!-- Questions Tab -->
        <div v-show="activeTab === 'questions'" class="tab-panel">
          <div class="questions-section">
            <h3>{{ $t('exam.questions') }}</h3>
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

            <!-- Question Count Info -->
            <div v-if="!loadingQuestions && !errorQuestions && questions.length > 0" class="question-count-info">
              <span class="selected-count">{{ selectedQuestions.length }} / {{ formData.questionCount }} {{ $t('examCreate.questionsSelected') }}</span>
              <div v-if="selectedQuestions.length > 0" class="points-info">
                <span class="total-points" :class="{
                  'points-warning': totalPoints !== 100,
                  'points-success': totalPoints === 100
                }">
                  {{ $t('examCreate.totalPoints') }}: {{ totalPoints }}/100
                </span>
                <button 
                  v-if="totalPoints !== 100 && selectedQuestions.length > 0"
                  @click="distributePointsEvenly"
                  class="distribute-btn"
                  :title="$t('examCreate.distributeEvenly')"
                >
                  <span class="material-symbols-outlined">balance</span>
                  {{ $t('examCreate.equalizePoints') }}
                </button>
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
                      <th>{{ $t('common.score') }}</th>
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
                      <td class="question-points">
                        <input 
                          v-if="selectedQuestions.includes(question._id)"
                          type="number"
                          :value="getQuestionPoints(question._id)"
                          @input="updateQuestionPoints(question._id, $event)"
                          min="1"
                          max="100"
                          class="points-input"
                          placeholder="Puan"
                        />
                        <span v-else class="points-placeholder">-</span>
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
                :disabled="selectedQuestions.length !== formData.questionCount || totalPoints !== 100"
              />
            </div>
          </div>
        </div>

        <!-- Students Tab -->
        <div v-show="activeTab === 'students'" class="tab-panel">
          <div class="students-section">
            <h3>{{ $t('exam.students') }}</h3>
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
                :disabled="totalPoints !== 100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
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

// Status helper functions
const getExamStatus = (exam) => {
  if (!exam) return 'draft';
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  
  if (now < startTime) return 'upcoming';
  if (now >= startTime && now <= endTime) return 'active';
  return 'completed';
};

const getStatusIcon = (exam) => {
  const status = getExamStatus(exam);
  switch (status) {
    case 'upcoming': return 'schedule';
    case 'active': return 'play_circle';
    case 'completed': return 'check_circle';
    default: return 'draft';
  }
};

const getExamStatusText = (exam) => {
  const status = getExamStatus(exam);
  switch (status) {
    case 'upcoming': return t('examDetail.upcoming');
    case 'active': return t('examDetail.active');
    case 'completed': return t('examDetail.completed');
    default: return t('examDetail.draft');
  }
};

const loading = ref(true);
const saving = ref(false);
const updating = ref(false);
const error = ref('');
const exam = ref(null);

// Tab management
const activeTab = ref('info');
const tabs = computed(() => [
  {
    key: 'info',
    label: t('examEdit.basicInfo'),
    icon: 'info'
  },
  {
    key: 'questions',
    label: t('exam.questions'),
    icon: 'quiz'
  },
  {
    key: 'students',
    label: t('exam.students'),
    icon: 'group'
  }
]);

// Form data
const formData = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  duration: 60,
  questionCount: 0,
  attemptLimit: 1
});

const errors = ref({});

// Questions
const questions = ref([]);
const selectedQuestions = ref([]);
const questionPoints = ref({});
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
      questionCount: exam.value.questionCount || 0,
      attemptLimit: exam.value.attemptLimit || 1
    };

    // Mevcut soruları ve öğrencileri yükle
    selectedQuestions.value = exam.value.questions?.map(q => q.questionId || q._id) || [];
    selectedStudents.value = exam.value.assignedStudents?.map(s => s._id) || [];
    
    // Mevcut puanları yükle (yeni format)
    if (exam.value.questions && exam.value.questions.length > 0) {
      exam.value.questions.forEach(q => {
        const questionId = q.questionId ? q.questionId._id || q.questionId : q._id;
        questionPoints.value[questionId] = q.points || 10;
      });
    }
    
    // Load questions and students when exam data is ready
    await Promise.all([loadQuestions(), loadStudents()]);
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

// Load questions from server
const loadQuestions = async () => {
  loadingQuestions.value = true;
  errorQuestions.value = '';
  try {
    const response = await api.get('/questions');
    questions.value = response.data;
  } catch (error) {
    console.error('Load questions error:', error);
    errorQuestions.value = error?.response?.data?.message || 'Questions could not be loaded';
  } finally {
    loadingQuestions.value = false;
  }
};

// Load students from server
const loadStudents = async () => {
  loadingStudents.value = true;
  errorStudents.value = '';
  try {
    if (authStore.user?.role === 'admin') {
      // Admin can see all students
      const response = await api.get('/auth/admin/users');
      students.value = response.data.filter((user) => user.role === 'student');
    } else if (authStore.user?.role === 'teacher') {
      // Teacher can only see assigned students
      const response = await api.get(`/teachers/${authStore.user._id}/students`);
      students.value = response.data;
    } else {
      students.value = [];
    }
  } catch (error) {
    console.error('Load students error:', error);
    errorStudents.value = error?.response?.data?.message || 'Students could not be loaded';
  } finally {
    loadingStudents.value = false;
  }
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
  
  if (!formData.value.attemptLimit || formData.value.attemptLimit < 1) {
    errors.value.attemptLimit = t('validation.required', { field: t('examCreate.attemptLimit') });
  }
  
  return Object.keys(errors.value).length === 0;
};

// Tab navigation
const nextStep = () => {
  // Validate questions step
  if (activeTab.value === 'questions') {
    if (selectedQuestions.value.length !== formData.value.questionCount) {
      showError(t('examCreate.validation.exactQuestionCount', { count: formData.value.questionCount }));
      return;
    }
    if (totalPoints.value !== 100) {
      showError(t('examCreate.validation.totalPointsMust100', { current: totalPoints.value }));
      return;
    }
  }
  
  // Navigate to next tab
  if (activeTab.value === 'info') {
    activeTab.value = 'questions';
  } else if (activeTab.value === 'questions') {
    activeTab.value = 'students';
  }
};

const previousStep = () => {
  // Navigate to previous tab
  if (activeTab.value === 'students') {
    activeTab.value = 'questions';
  } else if (activeTab.value === 'questions') {
    activeTab.value = 'info';
  }
};

// Step 1: Basic info validation and navigation
const handleStep1Submit = () => {
  if (!validateForm()) {
    return;
  }
  nextStep();
};

// Question selection
const toggleQuestion = (questionId) => {
  const index = selectedQuestions.value.indexOf(questionId);
  if (index > -1) {
    selectedQuestions.value.splice(index, 1);
    // Remove points when deselecting question
    delete questionPoints.value[questionId];
  } else {
    if (selectedQuestions.value.length < formData.value.questionCount) {
      selectedQuestions.value.push(questionId);
      // Set smart default points when selecting question
      const remainingQuestions = formData.value.questionCount - selectedQuestions.value.length + 1;
      const remainingPoints = 100 - Object.values(questionPoints.value).reduce((sum, points) => sum + points, 0);
      const smartDefaultPoints = Math.max(1, Math.floor(remainingPoints / remainingQuestions));
      questionPoints.value[questionId] = smartDefaultPoints;
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

const getQuestionPoints = (questionId) => {
  return questionPoints.value[questionId] || 10;
};

const updateQuestionPoints = (questionId, event) => {
  const target = event.target;
  const value = target?.value || '1';
  const points = parseInt(value) || 1;
  questionPoints.value[questionId] = Math.max(1, Math.min(100, points));
};

// Computed property to show total points
const totalPoints = computed(() => {
  return Object.values(questionPoints.value).reduce((sum, points) => sum + points, 0);
});

// Distribute 100 points evenly among selected questions
const distributePointsEvenly = () => {
  const numQuestions = selectedQuestions.value.length;
  if (numQuestions === 0) return;
  
  const basePoints = Math.floor(100 / numQuestions);
  const remainder = 100 % numQuestions;
  
  selectedQuestions.value.forEach((questionId, index) => {
    // Give base points to all, plus 1 extra to first 'remainder' questions
    questionPoints.value[questionId] = basePoints + (index < remainder ? 1 : 0);
  });
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
  // Final validation
  if (totalPoints.value !== 100) {
    showError(t('examCreate.validation.totalPointsMust100', { current: totalPoints.value }));
    return;
  }
  
  saving.value = true;
  try {
    // Update basic info
    const updateData = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      duration: parseInt(formData.value.duration),
      questionCount: parseInt(formData.value.questionCount),
      attemptLimit: parseInt(formData.value.attemptLimit)
    };
    
    await api.put(`/exams/${route.params.id}`, updateData);

    // Update questions with points
    if (selectedQuestions.value.length > 0) {
      await api.post(`/exams/${route.params.id}/add-questions`, {
        questionsWithPoints: selectedQuestions.value.map(questionId => ({
          questionId: questionId,
          points: questionPoints.value[questionId] || 10
        }))
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

// Watch activeTab changes to load data when needed
watch(activeTab, (newTab) => {
  if (newTab === 'questions' && questions.value.length === 0) {
    loadQuestions();
  } else if (newTab === 'students' && students.value.length === 0) {
    loadStudents();
  }
});

onMounted(() => {
  loadExam();
});
</script>

<style scoped lang="scss">
.exam-edit-container {
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

.header-right {
  margin-left: 24px;
}

.exam-status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  
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
  
  &.draft {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-secondary);
  border-top: 4px solid #667eea;
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
  background: rgba(239, 68, 68, 0.1);
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
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

.info-section {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border-secondary);
}

.questions-section, .students-section {
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 24px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-secondary);
  }
}

.exam-edit-form {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  padding: 0 12px;
}

.step-indicator {
  display: flex;
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
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
    font-size: 14px;
  }
  
  input, textarea, select {
    width: 100%;
    height: 40px;
    padding: 0 10px;
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
  
  textarea {
    height: auto;
    min-height: 80px;
    padding: 10px;
    resize: vertical;
  }
  
  select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 10px center;
    background-repeat: no-repeat;
    background-size: 14px;
    padding-right: 35px;
    
    option {
      background: var(--bg-primary);
      color: var(--text-primary);
    }
  }
  
  [data-theme="dark"] & select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  }
}

.step-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-primary);
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
      color: var(--text-primary);
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
    border-bottom: 1px solid var(--border-secondary);
  }
  
  th {
    background: var(--bg-secondary);
    font-weight: 600;
    color: var(--text-primary);
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
      background: var(--bg-secondary);
    }
    
    &.selected {
      background: rgba(102, 126, 234, 0.1);
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
    color: var(--text-primary);
  }
  
  .student-email {
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.page-header {
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
}

.header-content h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.header-content p {
  font-size: 14px;
  color: var(--text-secondary);
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

// Points UI Styles
.question-count-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-primary);
  flex-wrap: wrap;
  gap: 8px;
}

.selected-count {
  font-weight: 500;
  color: var(--text-primary);
}

.points-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.total-points {
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &.points-success {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  
  &.points-warning {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
}

.distribute-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--primary-500);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-600);
    transform: translateY(-1px);
  }
  
  .material-symbols-outlined {
    font-size: 14px;
  }
}

.selection-table {
  .points-input {
    width: 60px;
    padding: 6px 8px;
    border: 2px solid var(--border-primary);
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
    background: var(--bg-primary);
    color: var(--text-primary);
    
    &:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
  }
  
  .points-placeholder {
    color: var(--text-tertiary);
    font-size: 14px;
  }
}
</style>
