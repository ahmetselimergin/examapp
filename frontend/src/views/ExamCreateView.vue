<template>
  <div class="exam-create-container">
    <!-- Header -->
    <div class="header">
      <h2>Yeni Sınav Oluştur</h2>
      <div class="step-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          :class="['step', { 
            'active': currentStep === index + 1,
            'completed': currentStep > index + 1 
          }]"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
    </div>

    <!-- Step 1: Exam Basic Info -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="form-card">
        <h3>Sınav Bilgileri</h3>
        <form @submit.prevent="handleStep1Submit" class="exam-form">
          <div class="form-group">
            <label>Sınav Adı *</label>
            <input 
              v-model="examData.title" 
              type="text" 
              placeholder="Sınav adını girin"
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>Açıklama</label>
            <textarea 
              v-model="examData.description" 
              placeholder="Sınav açıklaması girin"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Başlangıç Zamanı *</label>
              <input 
                v-model="examData.startTime" 
                type="datetime-local"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Bitiş Zamanı *</label>
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
              <label>Sınav Süresi (Dakika) *</label>
              <input 
                v-model="examData.duration" 
                type="number"
                min="1"
                placeholder="60"
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Soru Sayısı *</label>
              <input 
                v-model="examData.questionCount" 
                type="number"
                min="1"
                placeholder="10"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <Button 
              type="submit" 
              styleType="primary" 
              size="medium" 
              :text="'Devam Et'"
              :loading="loading"
            />
          </div>
        </form>
      </div>
    </div>

    <!-- Step 2: Question Selection -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="form-card">
        <h3>Soru Seçimi</h3>
        <div v-if="loadingQuestions" class="loading">Sorular yükleniyor...</div>
        <div v-else-if="errorQuestions" class="error">{{ errorQuestions }}</div>
        <div v-else>
          <div v-if="questions.length === 0" class="empty-state">
            <Empty 
              icon="quiz"
              title="Soru bulunamadı"
              description="Henüz soru eklenmemiş. Önce soru bankasına soru ekleyin."
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
                  placeholder="Soru ara..."
                  class="search-input"
                />
                <span class="material-symbols-outlined search-icon">search</span>
              </div>
              <div class="filter-group">
                <select v-model="questionTypeFilter" class="filter-select">
                  <option value="">Tüm Tipler</option>
                  <option value="multiple-choice">Çoktan Seçmeli</option>
                  <option value="true-false">Doğru/Yanlış</option>
                  <option value="short-answer">Kısa Cevap</option>
                </select>
                <select v-model="difficultyFilter" class="filter-select">
                  <option value="">Tüm Zorluklar</option>
                  <option value="easy">Kolay</option>
                  <option value="medium">Orta</option>
                  <option value="hard">Zor</option>
                </select>
              </div>
            </div>
            
            <!-- Question Count Info -->
            <div class="question-count-info">
              <span class="selected-count">{{ selectedQuestions.length }} / {{ examData.questionCount }} soru seçildi</span>
              <span v-if="selectedQuestions.length > examData.questionCount" class="count-warning">
                Maksimum {{ examData.questionCount }} soru seçebilirsiniz
              </span>
            </div>
            
            <div class="questions-table">
              <table class="selection-table">
                <thead>
                  <tr>
                    <th class="select-column"></th>
                    <th>Soru Metni</th>
                    <th>Tip</th>
                    <th>Zorluk</th>
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
        
        <div class="form-actions">
          <Button 
            @click="previousStep" 
            styleType="secondary" 
            size="medium" 
            :text="'Geri'"
          />
          <Button 
            @click="nextStep" 
            styleType="primary" 
            size="medium" 
            :text="'Devam Et'"
            :disabled="selectedQuestions.length === 0"
          />
        </div>
      </div>
    </div>

    <!-- Step 3: Student Assignment -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="form-card">
        <h3>Öğrenci Ataması</h3>
        <div v-if="loadingStudents" class="loading">Öğrenciler yükleniyor...</div>
        <div v-else-if="errorStudents" class="error">{{ errorStudents }}</div>
        <div v-else>
          <div v-if="students.length === 0" class="empty-state">
            <Empty 
              icon="person_off"
              title="Öğrenci bulunamadı"
              description="Henüz öğrenci kaydı bulunmuyor."
              :show-action="false"
            />
          </div>
          <div v-else>
            <!-- Student Search -->
            <div class="search-filter-bar">
              <div class="search-box">
                <input 
                  v-model="studentSearch" 
                  type="text" 
                  placeholder="Öğrenci ara..."
                  class="search-input"
                />
                <span class="material-symbols-outlined search-icon">search</span>
              </div>
            </div>
            
            <!-- Student Count Info -->
            <div class="student-count-info">
              <span class="selected-count">{{ selectedStudents.length }} öğrenci seçildi</span>
            </div>
            
            <div class="students-table">
              <table class="selection-table">
                <thead>
                  <tr>
                    <th class="select-column"></th>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
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
                          @click.stop
                        />
                      </div>
                    </td>
                    <td class="student-name">
                      <h4>{{ student.name }}</h4>
                    </td>
                    <td class="student-email">
                      <p>{{ student.email }}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <Button 
            @click="previousStep" 
            styleType="secondary" 
            size="medium" 
            :text="'Geri'"
          />
          <Button 
            @click="finishExamCreation" 
            styleType="primary" 
            size="medium" 
            :text="'Sınavı Oluştur'"
            :loading="creatingExam"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Button from '../components/ui/Button.vue';
import Empty from '../components/ui/Empty.vue';
import DataTable from '../components/ui/DataTable.vue';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const { showSuccess, showError } = useToast();
const authStore = useAuthStore();

const steps = [
  { label: 'Sınav Bilgileri' },
  { label: 'Soru Seçimi' },
  { label: 'Öğrenci Ataması' }
];

const currentStep = ref(1);
const loading = ref(false);
const creatingExam = ref(false);

// Exam data
const examData = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  duration: 60,
  questionCount: 10,
  _id: ''
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
  { key: 'text', label: 'Soru Metni', sortable: true },
  { key: 'type', label: 'Tip', sortable: true, width: '120px' },
  { key: 'difficulty', label: 'Zorluk', sortable: true, width: '100px' }
];

const studentColumns = [
  { key: 'select', label: '', sortable: false, width: '50px' },
  { key: 'name', label: 'Ad Soyad', sortable: true },
  { key: 'email', label: 'E-posta', sortable: true }
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

// Step 1: Create exam
const handleStep1Submit = async () => {
  if (!examData.value.title || !examData.value.startTime || !examData.value.endTime || !examData.value.duration || !examData.value.questionCount) {
    showError('Lütfen tüm zorunlu alanları doldurun');
    return;
  }

  loading.value = true;
  try {
    console.log('Creating exam with data:', examData.value);
    console.log('User from authStore:', authStore.user);
    const response = await api.post('/exams', examData.value);
    console.log('Exam created:', response.data);
    console.log('Exam ID from response:', response.data._id);
    examData.value._id = response.data._id;
    console.log('Exam ID set in examData:', examData.value._id);
    currentStep.value = 2;
    loadQuestions();
  } catch (error: any) {
    console.error('Create exam error:', error);
    showError(error.response?.data?.message || 'Sınav oluşturulurken bir hata oluştu');
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

const nextStep = () => {
  if (currentStep.value === 2) {
    loadStudents();
  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
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
  creatingExam.value = true;
  try {
    console.log('Finishing exam creation for exam:', examData.value._id);
    console.log('Selected questions:', selectedQuestions.value);
    console.log('Selected students:', selectedStudents.value);
    
    // Add questions to exam
    if (selectedQuestions.value.length > 0) {
      console.log('Adding questions to exam...');
      await api.post(`/exams/${examData.value._id}/add-questions`, {
        questionIds: selectedQuestions.value
      });
    }

    // Assign students to exam
    if (selectedStudents.value.length > 0) {
      console.log('Assigning students to exam...');
      await api.post(`/exams/${examData.value._id}/assign-students`, {
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
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }

  &.completed {
    opacity: 0.8;
  }
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.exam-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
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
  color: #374151;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  color: #666;
}

.error {
  color: #ef4444;
  background: #fef2f2;
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
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 20px;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.question-count-info, .student-count-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.selected-count {
  font-weight: 500;
  color: #374151;
}

.count-warning {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.questions-list, .students-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* Selection Tables */
.questions-table, .students-table {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.selection-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.selection-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.selection-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.question-row, .student-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.question-row:hover, .student-row:hover {
  background: #f9fafb;
}

.question-row.selected, .student-row.selected {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
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
  color: #374151;
  line-height: 1.4;
}

.student-email p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.type-badge, .difficulty-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
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
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f9fafb;
  }

  &.selected {
    background: #eff6ff;
    border-color: #3b82f6;
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
  color: #111827;
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
  background: #f3f4f6;
  color: #6b7280;
}

.student-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
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
</style>