<template>
     <div class="exam-list">
          <div class="page-header">
            <div class="header-content">
              <h2>{{ $t('exam.title') }}</h2>
              <p>Sınavları yönetin ve düzenleyin</p>
            </div>
            <div class="header-actions">
              <Button
                v-if="authStore.user?.role === 'teacher' || authStore.user?.role === 'admin'"
                type="button"
                styleType="primary"
                size="medium"
                @click="$router.push('/exams/create')"
                icon="add"
                :text="$t('exam.createExam')"
              />
            </div>
          </div>
          
          <div v-if="loading" class="loading">Yükleniyor...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else>
            <div v-if="exams.length === 0" class="empty-exams">
              <Empty 
                icon="quiz"
                title="Sınav bulunamadı"
                description="Henüz oluşturulmuş sınav bulunmuyor."
                :action-text="$t('exam.createExam')"
                action-variant="primary"
                :show-action="authStore.user?.role === 'teacher' || authStore.user?.role === 'admin'"
                @action="$router.push('/exams/create')"
              />
            </div>
            <div v-else>
              <DataTable
                :data="exams"
                :columns="examColumns"
                :loading="loading"
                :actions="authStore.user?.role !== 'student'"
                :empty-icon="'quiz'"
                :empty-title="'Sınav bulunamadı'"
                :empty-description="'Henüz oluşturulmuş sınav bulunmuyor.'"
                :show-action="false"
                @row-double-click="handleExamClick"
              >
                <template #cell-title="{ item }">
                  <div class="exam-title">
                    <h4>{{ item.title }}</h4>
                  </div>
                </template>
                
                <template #cell-status="{ item }">
                  <div class="exam-status-cell">
                    <span class="status-badge" :class="getExamStatus(item)">
                      {{ getExamStatusText(item) }}
                    </span>
                  </div>
                </template>
                
                <template #cell-startTime="{ item }">
                  <div class="exam-time">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>{{ formatDateTime(item.startTime) }}</span>
                  </div>
                </template>
                
                <template #cell-endTime="{ item }">
                  <div class="exam-time">
                    <span class="material-symbols-outlined">event_available</span>
                    <span>{{ formatDateTime(item.endTime) }}</span>
                  </div>
                </template>
                
                <template #cell-duration="{ item }">
                  <div class="exam-duration">
                    <span class="material-symbols-outlined">timer</span>
                    <span>{{ item.duration }} dk</span>
                  </div>
                </template>
                
                <template #cell-questions="{ item }">
                  <div class="exam-questions">
                    <span class="material-symbols-outlined">quiz</span>
                    <span>{{ item.questions?.length || 0 }}/{{ item.questionCount || 0 }}</span>
                  </div>
                </template>
                
                <template #cell-students="{ item }">
                  <div class="exam-students">
                    <span class="material-symbols-outlined">group</span>
                    <span>{{ item.assignedStudents?.length || 0 }}</span>
                  </div>
                </template>
                
                <template #cell-attemptLimit="{ item }">
                  <div class="exam-attempt-limit">
                    <span class="material-symbols-outlined">counter_1</span>
                    <span>{{ item.attemptLimit || 1 }} {{ $t('examStudent.times') }}</span>
                  </div>
                </template>
                
                <template #cell-creator="{ item }">
                  <div class="exam-creator">
                    <span class="material-symbols-outlined">person</span>
                    <span>{{ item.createdBy?.name || 'Bilinmiyor' }}</span>
                  </div>
                </template>
                
                <template #actions="{ item, closeMenu }">
                  <button 
                    v-if="canEditExam(item)"
                    @click="editExam(item); closeMenu()" 
                    class="action-btn"
                  >
                    <span class="material-symbols-outlined">edit</span>
                    {{ t('common.edit') }}
                  </button>
                  <button 
                    v-if="canDeleteExam(item)"
                    @click="deleteExam(item); closeMenu()" 
                    class="action-btn"
                  >
                    <span class="material-symbols-outlined">delete</span>
                    {{ t('common.delete') }}
                  </button>
                </template>
              </DataTable>
            </div>
          </div>
     </div>
     
     <!-- Delete Confirmation Modal -->
     <ConfirmationModal
       v-if="showDeleteModal"
       :isOpen="showDeleteModal"
       :title="t('examDetail.confirmDelete')"
       :message="t('examDetail.confirmDeleteMessage', { examName: examToDelete?.title })"
       :confirm-text="t('common.delete')"
       :cancel-text="t('common.cancel')"
       confirm-style="danger"
       @confirm="confirmDelete"
       @cancel="showDeleteModal = false"
       @update:isOpen="showDeleteModal = $event"
     />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import Button from '../components/ui/Button.vue';
import Empty from '../components/ui/Empty.vue';
import DataTable from '../components/ui/DataTable.vue';
import ConfirmationModal from '../components/ui/ConfirmationModal.vue';
import { useToast } from '../composables/useToast';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useToast();
const { t } = useI18n();
const exams = ref([]);
const loading = ref(true);
const error = ref('');

// Table columns - different for students and teachers/admins
const examColumns = ref([]);

// Set columns based on user role
if (authStore.user?.role === 'student') {
  examColumns.value = [
    { key: 'title', label: t('exams.examName'), sortable: true },
    { key: 'status', label: t('exams.status'), sortable: true, width: '140px' },
    { key: 'startTime', label: t('exams.startTime'), sortable: true, width: '160px' },
    { key: 'endTime', label: t('exams.endTime'), sortable: true, width: '160px' },
    { key: 'duration', label: t('exams.duration'), sortable: true, width: '100px' },
    { key: 'questions', label: t('exams.questions'), sortable: true, width: '80px' },
    { key: 'attemptLimit', label: t('examCreate.attemptLimit'), sortable: true, width: '100px' }
  ];
} else {
  examColumns.value = [
    { key: 'title', label: t('exams.examName'), sortable: true },
    { key: 'status', label: t('exams.status'), sortable: true, width: '140px' },
    { key: 'startTime', label: t('exams.startTime'), sortable: true, width: '160px' },
    { key: 'endTime', label: t('exams.endTime'), sortable: true, width: '160px' },
    { key: 'duration', label: t('exams.duration'), sortable: true, width: '100px' },
    { key: 'questions', label: t('exams.questions'), sortable: true, width: '80px' },
    { key: 'students', label: t('exams.students'), sortable: true, width: '100px' },
    { key: 'creator', label: t('exams.creator'), sortable: true, width: '120px' }
  ];
}

// Modal states
const showDeleteModal = ref(false);
const examToDelete = ref(null);

const formatDate = (date) => {
     if (!date) return '-';
     const d = new Date(date);
     return d.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
     });
};

const formatDateTime = (date) => {
     if (!date) return '-';
     const d = new Date(date);
     return d.toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
     });
};

const getExamStatus = (exam) => {
     if (!exam || !exam.startTime || !exam.endTime) {
          return 'unknown';
     }
     
     const now = new Date();
     const startTime = new Date(exam.startTime);
     const endTime = new Date(exam.endTime);
     
     if (now < startTime) {
          return 'upcoming';
     }
     if (now >= startTime && now <= endTime) {
          return 'active';
     }
     return 'completed';
};

const getExamStatusText = (exam) => {
     const status = getExamStatus(exam);
     const statusMap = {
          upcoming: 'Yakında',
          active: 'Aktif',
          completed: 'Tamamlandı',
          unknown: 'Bilinmiyor'
     };
     return statusMap[status] || 'Bilinmiyor';
};

const isExamActive = (exam) => {
     const now = new Date();
     return now >= new Date(exam.startTime);
};

const handleExamClick = (exam) => {
     if (!isExamActive(exam)) {
          showError("Henüz başlama zamanı gelmedi.");
          return;
     }
     // Eğer öğrenci ise student route'a yönlendir
     if (authStore.user?.role === 'student') {
          router.push(`/exams/${exam._id}/student`);
     } else {
          router.push(`/exams/${exam._id}`);
     }
};

// Permission checks
const canEditExam = (exam) => {
     const isAdmin = authStore.user?.role === 'admin';
     const isCreator = authStore.user?.role === 'teacher' && exam.createdBy?._id === authStore.user?._id;
     
     return isAdmin || isCreator;
};

const canDeleteExam = (exam) => {
     if (!authStore.user) {
          return false;
     }
     
     const isAdmin = authStore.user?.role === 'admin';
     const isCreator = authStore.user?.role === 'teacher' && exam.createdBy?._id === authStore.user?._id;
     
     return isAdmin || isCreator;
};

// Edit exam
const editExam = (exam) => {
     router.push(`/exams/${exam._id}/edit`);
};

// Delete exam
const deleteExam = (exam) => {
     if (!canDeleteExam(exam)) {
          showError('Bu sınavı silme yetkiniz yok');
          return;
     }
     
     examToDelete.value = exam;
     showDeleteModal.value = true;
};

const confirmDelete = async () => {
     if (!examToDelete.value) {
          return;
     }
     
     try {
          const response = await api.delete(`/exams/${examToDelete.value._id}`);
          showSuccess('Sınav başarıyla silindi');
          await loadExams();
     } catch (error) {
          console.error('Delete error:', error);
          console.error('Error response:', error.response);
          showError(error.response?.data?.message || 'Sınav silinirken bir hata oluştu');
     } finally {
          showDeleteModal.value = false;
          examToDelete.value = null;
     }
};

const loadExams = async () => {
     loading.value = true;
     error.value = '';
     try {
          const token = localStorage.getItem('token');
          const res = await api.get('/exams', {
               headers: {
                    Authorization: `Bearer ${token}`
               }
          });
          exams.value = res.data;
     } catch (e) {
          console.error('Load exams error:', e);
          error.value = e.response?.data?.message || 'Sınavlar alınamadı';
     } finally {
          loading.value = false;
     }
};

onMounted(async () => {
     await loadExams();
});
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.header-content {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 6px 0;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}


.loading,
.error {
     text-align: center;
     padding: 40px;
     color: #666;
}

.error {
     color: #f44336;
}

.empty-exams {
  padding: 20px;
}

/* DataTable custom styles for exam list */
.exam-title h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}


.exam-status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  
  &.upcoming {
    background: #fef3c7;
    color: #92400e;
    border-color: #f59e0b;
  }
  
  &.active {
    background: #dcfce7;
    color: #166534;
    border-color: #22c55e;
  }
  
  &.completed {
    background: #f3f4f6;
    color: #374151;
    border-color: #9ca3af;
  }
  
  &.unknown {
    background: #fef2f2;
    color: #991b1b;
    border-color: #ef4444;
  }
}

.exam-time, .exam-duration, .exam-questions, .exam-students, .exam-creator, .exam-attempt-limit {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  
  .material-symbols-outlined {
    font-size: 16px;
  }
}

.exam-creator {
  font-weight: 500;
  color: #374151;
}

.exam-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.exams-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
     gap: 20px;
     margin-top: 20px;
}

.exam-card {
     background: white;
     border: 1px solid #e0e0e0;
     border-radius: 12px;
     padding: 20px;
     cursor: pointer;
     transition: all 0.2s ease;
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

     &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-color: #1976d2;
     }
}

.exam-header {
     display: flex;
     justify-content: space-between;
     align-items: flex-start;
     margin-bottom: 15px;
}

.exam-header h3 {
     margin: 0;
     color: #333;
     font-size: 1.2em;
     font-weight: 600;
     flex: 1;
}

.exam-status {
     padding: 4px 12px;
     border-radius: 20px;
     font-size: 12px;
     font-weight: 500;
     text-transform: uppercase;
     letter-spacing: 0.5px;

     &.upcoming {
          background: #fff3e0;
          color: #f57c00;
     }

     &.active {
          background: #e8f5e8;
          color: #2e7d32;
     }

     &.completed {
          background: #f5f5f5;
          color: #666;
     }
}

.description {
     color: #666;
     margin: 15px 0;
     font-size: 0.9em;
     line-height: 1.4;
}

.exam-details {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 12px;
     margin: 20px 0;
}

.detail-item {
     display: flex;
     align-items: center;
     gap: 8px;
     font-size: 14px;
     color: #555;

     .material-symbols-outlined {
          font-size: 16px;
          color: #1976d2;
     }
}

.meta {
     display: flex;
     flex-direction: column;
     gap: 5px;
     color: #888;
     font-size: 0.8em;
     margin-top: 15px;
     padding-top: 15px;
     border-top: 1px solid #f0f0f0;
}

.exam-card.disabled {
     opacity: 0.6;
     cursor: not-allowed;
     pointer-events: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 14px;
  width: 100%;
  text-align: left;

  &:hover {
    background: var(--bg-tertiary);
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
     .header {
          flex-direction: column;
          gap: 15px;
          align-items: stretch;
     }

     .exams-grid {
          grid-template-columns: 1fr;
     }

     .exam-details {
          grid-template-columns: 1fr;
     }
}
</style>