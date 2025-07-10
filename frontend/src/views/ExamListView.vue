<template>
     <div class="exam-list">
          <div class="header">
               <h2>{{ $t('exam.title') }}</h2>
               <router-link
                v-if="authStore.user?.role === 'teacher' || authStore.user?.role === 'admin'"
                to="/exams/create"
                class="create-btn"
              >
                <span class="material-symbols-outlined">add</span>
                {{ $t('exam.createExam') }}
              </router-link>
          </div>
          
          <div v-if="loading" class="loading">Yükleniyor...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else>
            <div v-if="exams.length === 0" class="no-exams">{{ $t('exam.noExams') }}</div>
            <div v-else class="exams-grid">
               <div v-for="exam in exams" :key="exam._id" class="exam-card" :class="{ disabled: !isExamActive(exam) }" @click="handleExamClick(exam)">
                    <div class="exam-header">
                         <h3>{{ exam.title }}</h3>
                         <div class="exam-status" :class="getExamStatus(exam)">
                              {{ getExamStatusText(exam) }}
                         </div>
                    </div>
                    <p class="description">{{ exam.description }}</p>
                    <div class="exam-details">
                         <div class="detail-item">
                              <span class="material-symbols-outlined">schedule</span>
                              <span>{{ formatDateTime(exam.startTime) }}</span>
                         </div>
                         <div class="detail-item">
                              <span class="material-symbols-outlined">timer</span>
                              <span>{{ exam.duration }} dakika</span>
                         </div>
                         <div class="detail-item">
                              <span class="material-symbols-outlined">quiz</span>
                              <span>{{ exam.questions?.length || 0 }} soru</span>
                         </div>
                         <div class="detail-item">
                              <span class="material-symbols-outlined">group</span>
                              <span>{{ exam.assignedStudents?.length || 0 }} öğrenci</span>
                         </div>
                    </div>
                    <div class="meta">
                         <span>Oluşturan: {{ exam.createdBy?.name }}</span>
                         <span>Oluşturulma: {{ formatDate(exam.createdAt) }}</span>
                    </div>
               </div>
            </div>
          </div>
     </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const exams = ref([]);
const loading = ref(true);
const error = ref('');

const formatDate = (date) => {
     return new Date(date).toLocaleDateString('tr-TR');
};

const formatDateTime = (date) => {
     return new Date(date).toLocaleString('tr-TR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
     });
};

const getExamStatus = (exam) => {
     const now = new Date();
     const startTime = new Date(exam.startTime);
     const endTime = new Date(exam.endTime);
     
     if (now < startTime) return 'upcoming';
     if (now >= startTime && now <= endTime) return 'active';
     return 'completed';
};

const getExamStatusText = (exam) => {
     const status = getExamStatus(exam);
     const statusMap = {
          upcoming: 'Yakında',
          active: 'Aktif',
          completed: 'Tamamlandı'
     };
     return statusMap[status];
};

const isExamActive = (exam) => {
     const now = new Date();
     return now >= new Date(exam.startTime);
};

const handleExamClick = (exam) => {
     if (!isExamActive(exam)) {
          alert("Henüz başlama zamanı gelmedi.");
          return;
     }
     // Eğer öğrenci ise student route'a yönlendir
     if (authStore.user?.role === 'student') {
          router.push(`/exams/${exam._id}/student`);
     } else {
          router.push(`/exams/${exam._id}`);
     }
};

onMounted(async () => {
     try {
          const token = localStorage.getItem('token');
          const res = await api.get('/exams', {
               headers: {
                    Authorization: `Bearer ${token}`
               }
          });
          exams.value = res.data;
     } catch (e) {
          error.value = e.response?.data?.message || 'Sınavlar alınamadı';
     } finally {
          loading.value = false;
     }
});
</script>

<style scoped lang="scss">
.exam-list {
     margin: 0 auto;
     padding: 20px 0;
}

.header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 30px;
}

.create-btn {
     display: flex;
     align-items: center;
     gap: 8px;
     background: #1976d2;
     color: white;
     padding: 12px 20px;
     border-radius: 8px;
     text-decoration: none;
     font-weight: 500;
     transition: background 0.2s ease;

     &:hover {
          background: #1565c0;
     }
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