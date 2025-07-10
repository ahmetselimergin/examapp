<template>
  <div class="question-bank-container">
    <h2>{{ t('questionBank.title') }}</h2>
    <p>{{ t('questionBank.description') }}</p>
    
    <div class="filter-bar">

      <Input size="medium" :label="t('questionBank.search')" v-model="search" :placeholder="t('questionBank.search')"></Input>

      <Select size="medium" :label="t('questionBank.questionType')" v-model="questionType" :options="questionTypes" :placeholder="t('questionBank.questionType')"></Select>

      <Select size="medium" :label="t('questionBank.difficulty')" v-model="difficulty" :options="difficultyOptions" :placeholder="t('questionBank.difficulty')"></Select>

      <Button type="button"  styleType="primary" size="medium" @click="openAddModal" icon="add" :text="t('questionBank.addQuestion')" />
    </div>
    <div v-if="loadingQuestions" class="loading">Sorular yükleniyor...</div>
    <div v-else-if="errorQuestions" class="error">{{ errorQuestions }}</div>
    <div v-else>
      <div v-if="filteredQuestions.length === 0" class="no-questions">{{ t('questionBank.noQuestions') }}</div>
      <div v-else class="question-list">
        <div v-for="q in paginatedQuestions" :key="q._id" class="question-card">
          <div class="question-header">
               <div class="w-full flex space-between align-center">
                    <div class="flex flex-row space-start align-center gap-1">
                         <div :class="'question-type ' + q.type">{{ getQuestionTypeLabel(q.type) }}</div>
                         <div :class="'difficulty-type ' + q.difficulty">{{ getDifficultyLabel(q.difficulty) }}</div>
                         <!-- <div :class="'date-type '">{{ formatDate(q.createdAt) }}</div> -->
                    </div>

                    <div class="question-actions">
                         <Button styleType="primary" rounded size="icon" @click="openEditModal(q)" icon="edit"  />
                         <Button styleType="danger" rounded size="icon" @click="handleQuestionDelete(q._id)" icon="delete"  />
                    </div>
               </div>
            <span class="question-text">{{ q.text }}</span>
            
          </div>
          <div v-if="q.options && q.options.length > 0" class="question-options">
            <!-- Tekli Seçim için -->
            <div v-if="q.type === 'single_choice'" v-for="(opt, idx) in q.options" :key="idx" class="option-item">
              <input type="radio" :checked="q.correctAnswers.includes(opt)" disabled />
              <span>{{ opt }}</span>
            </div>

            <!-- Çoklu Seçim için -->
            <div v-if="q.type === 'multiple_select'" v-for="(opt, idx) in q.options" :key="idx" class="option-item">
              <input type="checkbox" :checked="q.correctAnswers.includes(opt)" disabled />
              <span>{{ opt }}</span>
            </div>
          </div>

          <!-- True/False için -->
          <div v-if="q.type === 'true_false'" class="question-options">
            <div class="option-item">
              <input type="radio" :checked="q.correctAnswers[0] === 'true'" disabled />
              <span>{{ t('questionBank.true') }}</span>
            </div>
            <div class="option-item">
              <input type="radio" :checked="q.correctAnswers[0] === 'false'" disabled />
              <span>{{ t('questionBank.false') }}</span>
            </div>
          </div>

          <!-- Açık Uçlu için -->
          <div v-if="q.type === 'open_ended'" class="question-options">
            <div class="option-item answer-text">
              {{ q.correctAnswers[0] }}
            </div>
          </div>
          
        </div>
        <Pagination
          v-model="currentPage"
          :total-items="filteredQuestions.length"
          :per-page="itemsPerPage"
        />
      </div>
    </div>


    <Modal v-model="showAddModal" title="Add New Question">
      <QuestionForm @save="handleQuestionSave" />
      <template #footer>
        <Button styleType="lightgrey" size="medium" @click="closeAddModal" :text="t('common.cancel')" />
      </template>
    </Modal>

    <Modal v-model="showEditModal" title="Edit Question">
      <QuestionForm v-if="editingQuestion" :initial-question="editingQuestion" @save="handleQuestionUpdate" />
      <template #footer>
        <Button styleType="lightgrey" size="medium" @click="closeEditModal" :text="t('common.cancel')" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Modal from '../components/ui/Modal.vue';
import Button from '../components/ui/Button.vue';
import Input from '../components/ui/Input.vue';
import Select from '../components/ui/Select.vue';
import Pagination from '../components/ui/Pagination.vue';
import QuestionForm from '../components/exam/QuestionForm.vue';
import api from '../services/api';
import { useI18n } from 'vue-i18n';
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n()

// Dil değiştirmek için:
const changeLanguage = (lang) => {
  locale.value = lang
}

const questionTypes = ref([
  { label: t('questionBank.allQuestions'), value: 'all' },
  { label: t('questionBank.singleChoice'), value: 'single_choice' },
  { label: t('questionBank.multipleSelect'), value: 'multiple_select' },
  { label: t('questionBank.trueFalse'), value: 'true_false' },
  { label: t('questionBank.openEnded'), value: 'open_ended' },
]);

const difficultyOptions = ref([
  { label: t('questionBank.allDifficulties'), value: 'all' },
  { label: t('questionBank.easy'), value: 'easy' },
  { label: t('questionBank.medium'), value: 'medium' },
  { label: t('questionBank.hard'), value: 'hard' },
]);

// Erişim kontrolü: sadece admin ve teacher
if (!authStore.isAuthenticated || !['admin', 'teacher'].includes(authStore.user?.role || '')) {
  router.replace('/');
}

const search = ref('');
const questionType = ref('');
const difficulty = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const showAddModal = ref(false);
const openAddModal = () => { showAddModal.value = true; };
const closeAddModal = () => { showAddModal.value = false; };

const showEditModal = ref(false);
const editingQuestion = ref(null);
const openEditModal = (question) => {
  editingQuestion.value = { ...question };
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  editingQuestion.value = null;
};

const questions = ref([]);
const loadingQuestions = ref(false);
const errorQuestions = ref('');

const fetchQuestions = async () => {
  loadingQuestions.value = true;
  try {
    const res = await api.get('/questions');
    questions.value = res.data; // Remove the mapping that sets default values
  } catch (e) {
    console.error('Error fetching questions:', e); // Debug log
    errorQuestions.value = e.response?.data?.message || 'Sorular alınamadı';
  } finally {
    loadingQuestions.value = false;
  }
};

onMounted(fetchQuestions);

const handleQuestionSave = async (question) => {
  try {
    await api.post('/questions', question);
    closeAddModal();
    await fetchQuestions();
  } catch (e) {
    alert(e.response?.data?.message || 'Soru eklenirken bir hata oluştu');
  }
};

const handleQuestionUpdate = async (question) => {
  try {
    await api.patch(`/questions/${question._id}`, question);
    closeEditModal();
    await fetchQuestions();
  } catch (e) {
    alert(e.response?.data?.message || 'Soru güncellenirken bir hata oluştu');
  }
};

const handleQuestionDelete = async (id) => {
  if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;
  try {
    await api.delete(`/questions/${id}`);
    await fetchQuestions();
  } catch (e) {
    alert(e.response?.data?.message || 'Soru silinirken bir hata oluştu');
  }
};

const filteredQuestions = computed(() => {
  let filtered = questions.value;
  if (questionType.value && questionType.value !== 'all') {
    filtered = filtered.filter(q => q.type === questionType.value);
  }
  if (search.value) {
    filtered = filtered.filter(q => q.text.toLowerCase().includes(search.value.toLowerCase()));
  }
  if (difficulty.value && difficulty.value !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty.value);
  }
  return filtered;
});

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredQuestions.value.slice(start, end);
});

const getQuestionTypeLabel = (type) => {
  const questionType = questionTypes.value.find(qt => qt.value === type);
  return questionType ? questionType.label : type;
};

const getDifficultyLabel = (difficulty) => {
  console.log('Getting difficulty label for:', difficulty); // Debug log
  if (!difficulty) return t('questionBank.unspecified');
  
  const difficultyMap = {
    'easy': t('questionBank.easy'),
    'medium': t('questionBank.medium'),
    'hard': t('questionBank.hard')
  };
  return difficultyMap[difficulty] || t('questionBank.unspecified');
};

const formatDate = (dateString) => {
  console.log('Formatting date:', dateString); // Debug log
  if (!dateString) return 'Tarih belirtilmemiş';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Geçersiz tarih';
    }
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Tarih formatı hatası';
  }
};
</script>

<style scoped>
.filter-bar {
  display: grid;
  gap: 12px;
  align-items: center;
  margin: 24px 0 16px 0;
    grid-template-columns: 2fr 2fr 2fr 1fr;

}
.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.import-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
}
.add-question-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
}
.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
.question-card {
  background:rgb(255, 255, 255);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.question-header {
  flex-direction: column;
  margin-bottom: 8px;
  display: flex;
  align-items: start;
  gap: 8px;
  .question-text {
    font-size: .875em;
    font-weight:500;
  }
}
.question-type {
  color: #888;
  font-size: 0.95em;
}
.question-options {
  margin: 12px 0 0 0;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 0.98em;
  border: 1px solid #e9e9e9;
  padding: .75em .5em;
  border-radius: 4px;
  
&.answer-text {
     color: #4b5563;
     font-style: italic;
     background: #e9e9e9;
     font-weight: 600;
}

  input[type="radio"],
  input[type="checkbox"] {
    margin: 0;
    cursor: not-allowed;
  }

  span {
    margin-left: 4px;
  }
}

.question-meta {
  margin-top: 8px;
  color: #666;
  font-size: 0.95em;
}
.loading {
  text-align: center;
  padding: 24px;
}
.error {
  color: red;
  text-align: center;
  padding: 24px;
}
.no-questions {
  text-align: center;
  color: #888;
  padding: 24px;
}
.question-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}
.edit-btn {
  background: #fbbf24;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 500;
}
.delete-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 500;
}

.question-type{
     font-size: 12px;
     padding: 4px 8px;
     border-radius: 1em;
     font-weight: 600;
     &.multiple_select{
          background-color: rgb(219 234 254);
          color: rgb(30 64 175);
     }
     &.true_false{
          background-color: rgb(220 252 231);
          color: rgb(22 163 74);
     }
     &.open_ended{
          background-color: rgb(253 230 138);
          color: rgb(249 115 22);
     }
     &.single_choice{
          background-color: rgb(219 209 243);
          color: rgb(82 48 193);
     }
     
}
.difficulty-type {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 1em;
  font-weight: 600;
}
.difficulty-type.easy {
  background-color: #dcfce7;   /* Açık yeşil */
  color: #15803d;              /* Koyu yeşil */
}
.difficulty-type.medium {
  background-color: #fef9c3;   /* Açık sarı */
  color: #b45309;              /* Koyu turuncu */
}
.difficulty-type.hard {
  background-color: #fee2e2;   /* Açık kırmızı */
  color: #b91c1c;              /* Koyu kırmızı */
}
</style>

