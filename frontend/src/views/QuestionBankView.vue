<template>
  <div class="question-bank-container">
    <div class="page-header">
      <div class="header-content">
        <h2>{{ t('questionBank.title') }}</h2>
        <p>{{ t('questionBank.description') }}</p>
      </div>
      <div class="header-actions">
        <Button type="button" styleType="primary" size="medium" @click="openAddModal" icon="add" :text="t('questionBank.addQuestion')" />
      </div>
    </div>
    
    <div v-if="loadingQuestions" class="loading">Sorular yükleniyor...</div>
    <div v-else-if="errorQuestions" class="error">{{ errorQuestions }}</div>
    <div v-else>
      <DataTable
        :data="filteredQuestions"
        :columns="tableColumns"
        :title="t('questionBank.title')"
        :actions="true"
        :selectable="false"
        :pagination="true"
        :page-size="itemsPerPage"
      >
        <template #cell-text="{ item }">
          <div class="question-text-cell">
            <div class="question-text">{{ item.text }}</div>
            <div v-if="item.options && item.options.length > 0" class="question-preview">
              <span class="options-count">{{ item.options.length }} {{ t('questionBank.options') }}</span>
            </div>
          </div>
        </template>

        <template #cell-type="{ item }">
          <span :class="'question-type-badge ' + item.type">
            {{ getQuestionTypeLabel(item.type) }}
          </span>
        </template>

        <template #cell-difficulty="{ item }">
          <span :class="'difficulty-badge ' + item.difficulty">
            {{ getDifficultyLabel(item.difficulty) }}
          </span>
        </template>

        <template #cell-createdAt="{ item }">
          <span class="date-text">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #actions="{ item, closeMenu }">
          <button class="action-btn edit-btn" @click="openEditModal(item); closeMenu()">
            <span class="material-symbols-outlined">edit</span>
            {{ t('common.edit') }}
          </button>
          <button class="action-btn delete-btn" @click="handleQuestionDelete(item._id); closeMenu()">
            <span class="material-symbols-outlined">delete</span>
            {{ t('common.delete') }}
          </button>
        </template>

        <template #empty>
          <Empty 
            icon="quiz"
            :title="t('questionBank.noQuestions')"
            :description="t('questionBank.noQuestionsDescription')"
            :action-text="t('questionBank.addQuestion')"
            action-variant="primary"
            :show-action="true"
            @action="openAddModal"
          />
        </template>
      </DataTable>
    </div>


    <Modal 
      :modelValue="showAddModal" 
      @update:modelValue="handleAddModalUpdate" 
      title="Yeni Soru Ekle"
      :fullscreen="true"
      class="fullscreen-modal"
    >
      <template #header>
        <div class="modal-header-content">
          <h3 class="modal-title">Yeni Soru Ekle</h3>
          <div class="modal-header-actions">
            <Button 
              styleType="primary" 
              size="medium" 
              @click="saveQuestion" 
              :text="t('common.save')" 
            />
            <button class="modal-close" @click="closeAddModal">
              <span>&times;</span>
            </button>
          </div>
        </div>
      </template>
      <div class="fullscreen-content">
        <QuestionForm ref="questionFormRef" @save="handleQuestionSave" />
      </div>
    </Modal>

    <Modal 
      :modelValue="showEditModal" 
      @update:modelValue="handleEditModalUpdate" 
      title="Soruyu Düzenle"
      :fullscreen="true"
      class="fullscreen-modal"
    >
      <template #header>
        <div class="modal-header-content">
          <h3 class="modal-title">Soruyu Düzenle</h3>
          <div class="modal-header-actions">
            <Button 
              styleType="primary" 
              size="medium" 
              @click="updateQuestion" 
              :text="t('common.save')" 
            />
            <button class="modal-close" @click="closeEditModal">
              <span>&times;</span>
            </button>
          </div>
        </div>
      </template>
      <div class="fullscreen-content">
        <QuestionForm v-if="editingQuestion" ref="editQuestionFormRef" :initial-question="editingQuestion" @save="handleQuestionUpdate" />
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Modal from '../components/ui/Modal.vue';
import Button from '../components/ui/Button.vue';
import DataTable from '../components/ui/DataTable.vue';
import Empty from '../components/ui/Empty.vue';
import QuestionForm from '../components/exam/QuestionForm.vue';
import api from '../services/api';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import type { DataTableColumn } from '../types';
const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();
const { showSuccess, showError } = useToast();


// Table columns configuration
const tableColumns = ref<DataTableColumn[]>([
  {
    key: 'text',
    label: t('questionBank.questionText'),
    sortable: true,
    filterable: true
  },
  {
    key: 'type',
    label: t('questionBank.type'),
    sortable: true,
    filterable: true
  },
  {
    key: 'difficulty',
    label: t('questionBank.difficulty'),
    sortable: true,
    filterable: true
  },
  {
    key: 'createdAt',
    label: t('questionBank.createdAt'),
    sortable: true,
    filterable: false
  }
]);

const questionTypes = ref([
  { label: t('questionBank.allQuestions'), value: 'all' },
  { label: t('questionBank.singleChoice'), value: 'single_choice' },
  { label: t('questionBank.multipleSelect'), value: 'multiple_select' },
  { label: t('questionBank.trueFalse'), value: 'true_false' },
  { label: t('questionBank.openEnded'), value: 'open_ended' },
]);


// Erişim kontrolü: sadece admin ve teacher
if (!authStore.isAuthenticated || !['admin', 'teacher'].includes(authStore.user?.role || '')) {
  router.replace('/');
}

const itemsPerPage = ref(10);

const showAddModal = ref(false);
const openAddModal = () => { showAddModal.value = true; };
const closeAddModal = () => { showAddModal.value = false; };

const showEditModal = ref(false);
const editingQuestion = ref(null);

// Form refs
const questionFormRef = ref<any>(null);
const editQuestionFormRef = ref<any>(null);
const openEditModal = (question: any) => {
  editingQuestion.value = { ...question };
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  editingQuestion.value = null;
};

const handleAddModalUpdate = (value: boolean) => {
  showAddModal.value = value;
};

const handleEditModalUpdate = (value: boolean) => {
  showEditModal.value = value;
  if (!value) {
    editingQuestion.value = null;
  }
};

const questions = ref<any[]>([]);
const loadingQuestions = ref(false);
const errorQuestions = ref('');

const fetchQuestions = async () => {
  loadingQuestions.value = true;
  try {
    const res = await api.get('/questions');
    console.log('Questions response:', res.data); // Debug log
    questions.value = res.data || []; // Ensure it's an array
  } catch (e: any) {
    console.error('Error fetching questions:', e); // Debug log
    errorQuestions.value = e.response?.data?.message || 'Sorular alınamadı';
  } finally {
    loadingQuestions.value = false;
  }
};

onMounted(fetchQuestions);

const saveQuestion = () => {
  if (questionFormRef.value) {
    // Try to find the form element more safely
    const form = questionFormRef.value.$el?.querySelector('form');
    if (form) {
      form.requestSubmit();
    } else {
      // Fallback: trigger the submit event directly on the component
      questionFormRef.value.handleSubmit();
    }
  }
};

const updateQuestion = () => {
  if (editQuestionFormRef.value) {
    // Try to find the form element more safely
    const form = editQuestionFormRef.value.$el?.querySelector('form');
    if (form) {
      form.requestSubmit();
    } else {
      // Fallback: trigger the submit event directly on the component
      editQuestionFormRef.value.handleSubmit();
    }
  }
};

const handleQuestionSave = async (question: any) => {
  try {
    await api.post('/questions', question);
    showSuccess('Soru başarıyla eklendi!');
    closeAddModal();
    await fetchQuestions();
  } catch (e: any) {
    showError(e.response?.data?.message || 'Soru eklenirken bir hata oluştu');
  }
};

const handleQuestionUpdate = async (question: any) => {
  try {
    await api.patch(`/questions/${question._id}`, question);
    showSuccess('Soru başarıyla güncellendi!');
    closeEditModal();
    await fetchQuestions();
  } catch (e: any) {
    showError(e.response?.data?.message || 'Soru güncellenirken bir hata oluştu');
  }
};

const handleQuestionDelete = async (id: string) => {
  if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;
  try {
    await api.delete(`/questions/${id}`);
    showSuccess('Soru başarıyla silindi!');
    await fetchQuestions();
  } catch (e: any) {
    showError(e.response?.data?.message || 'Soru silinirken bir hata oluştu');
  }
};

const filteredQuestions = computed(() => {
  return questions.value;
});

const getQuestionTypeLabel = (type: string) => {
  const questionType = questionTypes.value.find(qt => qt.value === type);
  return questionType ? questionType.label : type;
};

const getDifficultyLabel = (difficulty: string) => {
  console.log('Getting difficulty label for:', difficulty); // Debug log
  if (!difficulty) return t('questionBank.unspecified');
  
  const difficultyMap = {
    'easy': t('questionBank.easy'),
    'medium': t('questionBank.medium'),
    'hard': t('questionBank.hard')
  };
  return difficultyMap[difficulty as keyof typeof difficultyMap] || t('questionBank.unspecified');
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

</script>

<style scoped>

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 6px 0;
  }
  
  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #6b7280;
  font-size: 16px;
}

.error {
  color: #dc2626;
  text-align: center;
  padding: 48px;
  background: #fee2e2;
  border-radius: 8px;
  margin: 24px 0;
}

/* Table cell styles */
.question-text-cell {
  .question-text {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.5;
  }
  
  .question-preview {
    .options-count {
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      padding: 2px 8px;
      border-radius: 12px;
    }
  }
}

.question-type-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  display: inline-block;
  
  &.multiple_select {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  &.true_false {
    background-color: #dcfce7;
    color: #16a34a;
  }
  
  &.open_ended {
    background-color: #fed7aa;
    color: #ea580c;
  }
  
  &.single_choice {
    background-color: #e0e7ff;
    color: #5b21b6;
  }
}

.difficulty-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  display: inline-block;
  
  &.easy {
    background-color: #dcfce7;
    color: #15803d;
  }
  
  &.medium {
    background-color: #fef3c7;
    color: #d97706;
  }
  
  &.hard {
    background-color: #fee2e2;
    color: #dc2626;
  }
}

.date-text {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Action buttons in table */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  color: var(--text-primary);
  
  .material-symbols-outlined {
    font-size: 16px;
  }
  
  &:hover {
    background: #f3f4f6;
  }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  
  .empty-icon {
    margin-bottom: 16px;
    
    .material-symbols-outlined {
      font-size: 48px;
      color: #d1d5db;
    }
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #6b7280;
    margin: 0 0 24px 0;
  }
}

.fullscreen-content {
  height: 100%;
  padding: 24px;
  background: #f9fafb;
  overflow-y: auto;
}

.modal-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close:hover {
  color: #333;
  background-color: #f5f5f5;
}
</style>

