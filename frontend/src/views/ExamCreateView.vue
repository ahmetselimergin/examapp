<template>
  <div class="exam-create-container">
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
        <form @submit.prevent="saveExamInfo" class="exam-form">
          <div class="form-group">
            <Input 
              :label="'Sınav Adı'" 
              v-model="examData.title" 
              :placeholder="'Sınav adını girin'"
              required
            />
          </div>
          
          <div class="form-group">
            <Input 
              :label="'Açıklama'" 
              v-model="examData.description" 
              :placeholder="'Sınav açıklaması girin'"
              type="textarea"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <Input 
                :label="'Başlangıç Zamanı'" 
                v-model="examData.startTime" 
                type="datetime-local"
                required
              />
            </div>
            
            <div class="form-group">
              <Input 
                :label="'Bitiş Zamanı'" 
                v-model="examData.endTime" 
                type="datetime-local"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <Input 
              :label="'Sınav Süresi (Dakika)'" 
              v-model="examData.duration" 
              type="number"
              :placeholder="'60'"
              min="1"
              required
            />
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
        <div class="step-header">
          <h3>Soru Seçimi</h3>
          <div class="selected-count">
            Seçilen: {{ selectedQuestions.length }} soru
          </div>
        </div>

        <div class="filter-bar">
          <Input 
            :label="'Soru Ara'" 
            v-model="questionSearch" 
            :placeholder="'Soru metninde ara...'"
          />
          
          <Select 
            :label="'Soru Tipi'" 
            v-model="questionTypeFilter" 
            :options="questionTypeOptions"
          />
          
          <Select 
            :label="'Zorluk'" 
            v-model="difficultyFilter" 
            :options="difficultyOptions"
          />
        </div>

        <div v-if="loadingQuestions" class="loading">
          Sorular yükleniyor...
        </div>
        
        <div v-else-if="errorQuestions" class="error">
          {{ errorQuestions }}
        </div>
        
        <div v-else class="questions-grid">
          <div 
            v-for="question in filteredQuestions" 
            :key="question._id"
            :class="['question-card', { 'selected': isQuestionSelected(question._id) }]"
            @click="toggleQuestionSelection(question._id)"
          >
            <div class="question-header">
              <div class="question-type">{{ getQuestionTypeLabel(question.type) }}</div>
              <div class="question-difficulty">{{ getDifficultyLabel(question.difficulty) }}</div>
            </div>
            
            <div class="question-text">{{ question.text }}</div>
            
            <div class="question-options" v-if="question.options && question.options.length > 0">
              <div v-for="(option, idx) in question.options.slice(0, 3)" :key="idx" class="option">
                {{ option }}
              </div>
              <div v-if="question.options.length > 3" class="more-options">
                +{{ question.options.length - 3 }} şık daha
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button 
            @click="previousStep" 
            styleType="lightgrey" 
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
        <div class="step-header">
          <h3>Öğrenci Ataması</h3>
          <div class="selected-count">
            Seçilen: {{ selectedStudents.length }} öğrenci
          </div>
        </div>

        <div class="filter-bar">
          <Input 
            :label="'Öğrenci Ara'" 
            v-model="studentSearch" 
            :placeholder="'Ad veya e-posta ile ara...'"
          />
        </div>

        <div v-if="loadingStudents" class="loading">
          Öğrenciler yükleniyor...
        </div>
        
        <div v-else-if="errorStudents" class="error">
          {{ errorStudents }}
        </div>
        
        <div v-else class="students-grid">
          <div 
            v-for="student in filteredStudents" 
            :key="student._id"
            :class="['student-card', { 'selected': isStudentSelected(student._id) }]"
            @click="toggleStudentSelection(student._id)"
          >
            <div class="student-avatar">
              {{ student.name.charAt(0).toUpperCase() }}
            </div>
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-email">{{ student.email }}</div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button 
            @click="previousStep" 
            styleType="lightgrey" 
            size="medium" 
            :text="'Geri'"
          />
          <Button 
            @click="finishExamCreation" 
            styleType="primary" 
            size="medium" 
            :text="'Sınavı Oluştur'"
            :loading="creatingExam"
            :disabled="selectedStudents.length === 0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import Input from '../components/ui/Input.vue';
import Select from '../components/ui/Select.vue';
import Button from '../components/ui/Button.vue';

const router = useRouter();
const { t } = useI18n();

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
  duration: 60
});

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

const questionTypeOptions = [
  { label: 'Tümü', value: '' },
  { label: 'Çoktan Tek Seçmeli', value: 'single_choice' },
  { label: 'Çoktan Çok Seçmeli', value: 'multiple_select' },
  { label: 'Doğru/Yanlış', value: 'true_false' },
  { label: 'Kısa Cevap', value: 'open_ended' }
];

const difficultyOptions = [
  { label: 'Tümü', value: '' },
  { label: 'Kolay', value: 'easy' },
  { label: 'Orta', value: 'medium' },
  { label: 'Zor', value: 'hard' }
];

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
  let filtered = students.value.filter(s => s.role === 'student');
  
  if (studentSearch.value) {
    const search = studentSearch.value.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) || 
      s.email.toLowerCase().includes(search)
    );
  }
  
  return filtered;
});

const saveExamInfo = async () => {
  loading.value = true;
  try {
    const response = await api.post('/exams', examData.value);
    examData.value._id = response.data._id;
    currentStep.value = 2;
  } catch (error) {
    alert(error.response?.data?.message || 'Sınav oluşturulurken bir hata oluştu');
  } finally {
    loading.value = false;
  }
};

const fetchQuestions = async () => {
  loadingQuestions.value = true;
  try {
    const response = await api.get('/questions');
    questions.value = response.data;
  } catch (error) {
    errorQuestions.value = error.response?.data?.message || 'Sorular yüklenirken hata oluştu';
  } finally {
    loadingQuestions.value = false;
  }
};

const fetchStudents = async () => {
  loadingStudents.value = true;
  try {
    const response = await api.get('/auth/admin/users');
    students.value = response.data;
  } catch (error) {
    errorStudents.value = error.response?.data?.message || 'Öğrenciler yüklenirken hata oluştu';
  } finally {
    loadingStudents.value = false;
  }
};

const isQuestionSelected = (questionId) => {
  return selectedQuestions.value.includes(questionId);
};

const toggleQuestionSelection = (questionId) => {
  const index = selectedQuestions.value.indexOf(questionId);
  if (index > -1) {
    selectedQuestions.value.splice(index, 1);
  } else {
    selectedQuestions.value.push(questionId);
  }
};

const isStudentSelected = (studentId) => {
  return selectedStudents.value.includes(studentId);
};

const toggleStudentSelection = (studentId) => {
  const index = selectedStudents.value.indexOf(studentId);
  if (index > -1) {
    selectedStudents.value.splice(index, 1);
  } else {
    selectedStudents.value.push(studentId);
  }
};

const getQuestionTypeLabel = (type) => {
  const option = questionTypeOptions.find(opt => opt.value === type);
  return option ? option.label : type;
};

const getDifficultyLabel = (difficulty) => {
  const option = difficultyOptions.find(opt => opt.value === difficulty);
  return option ? option.label : difficulty;
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const finishExamCreation = async () => {
  creatingExam.value = true;
  try {
    // Add questions to exam
    if (selectedQuestions.value.length > 0) {
      await api.post(`/exams/${examData.value._id}/add-questions`, {
        questionIds: selectedQuestions.value
      });
    }

    // Assign students to exam
    if (selectedStudents.value.length > 0) {
      await api.post(`/exams/${examData.value._id}/assign-students`, {
        studentIds: selectedStudents.value
      });
    }

    alert('Sınav başarıyla oluşturuldu!');
    router.push('/exams');
  } catch (error) {
    alert(error.response?.data?.message || 'Sınav oluşturulurken bir hata oluştu');
  } finally {
    creatingExam.value = false;
  }
};

onMounted(() => {
  fetchQuestions();
  fetchStudents();
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
  background: #1976d2;
  color: white;
}

.step.completed .step-number {
  background: #4caf50;
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

.form-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.selected-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
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

.filter-bar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.question-card {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1976d2;
    background: #f0f8ff;
  }

  &.selected {
    border-color: #1976d2;
    background: #e3f2fd;
  }
}

.question-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.question-type {
  background: #1976d2;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.question-difficulty {
  background: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.question-text {
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.4;
}

.question-options {
  font-size: 14px;
  color: #666;
}

.option {
  margin-bottom: 4px;
}

.more-options {
  font-style: italic;
  color: #999;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1976d2;
    background: #f0f8ff;
  }

  &.selected {
    border-color: #1976d2;
    background: #e3f2fd;
  }
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.student-email {
  font-size: 14px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #f44336;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filter-bar {
    grid-template-columns: 1fr;
  }
  
  .questions-grid {
    grid-template-columns: 1fr;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>