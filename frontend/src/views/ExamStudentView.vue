<template>
  <div class="exam-student-container">
    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Sınav Giriş Ekranı -->
      <div class="exam-intro-new">
        <!-- Back Button and Title -->
        <div class="exam-header-section">
          <button class="back-button" @click="goBack">
            <span class="material-symbols-outlined">arrow_back</span>
            {{ t('common.previous') }}
          </button>
              </div>
        
        <!-- Exam Title -->
        <div class="exam-title-section">
          <h1 class="exam-name">{{ exam.title || "Exam name" }}</h1>
            </div>

        <!-- Exam Details Grid -->
        <div class="exam-details-grid">
          <div class="detail-item">
            <div class="detail-label">{{ t('examStudent.startDate') }}</div>
            <div class="detail-value">{{ formatDateTime(exam.startTime) }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">{{ t('examStudent.endDate') }}</div>
            <div class="detail-value">{{ formatDateTime(exam.endTime) }}</div>
          </div>

           <div class="detail-item">
             <div class="detail-label">{{ t('examStudent.questionLength') }}</div>
             <div class="detail-value">{{ exam.questions?.length || 0 }}</div>
          </div>

           <div class="detail-item">
             <div class="detail-label">{{ t('examCreate.attemptLimit') }}</div>
             <div class="detail-value">{{ exam.attemptLimit || 1 }} {{ t('examStudent.times') }}</div>
          </div>
        </div>

        <!-- Exam Rules -->
        <div class="exam-rules-section">
          <div class="rules-title">{{ t('examStudent.examRules') }}:</div>
          <div class="rules-content">
            <p>
              {{ exam.description || t('examStudent.defaultRules') }}
            </p>
          </div>
        </div>
        <!-- Start Button -->           
        <div class="start-button-section">
          <button
            class="start-exam-btn"
            @click="startExam"
            :disabled="countdown > 0"
          >
            <span v-if="countdown > 0">{{ formatCountdown(countdown) }}</span>
            <span v-else>{{ t('examTaking.startExam') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";

import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import Button from "../components/ui/Button.vue";
import { useToast } from "../composables/useToast";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { showError, showWarning } = useToast();
const { t } = useI18n();

const exam = ref({});
const loading = ref(true);
const error = ref("");
const countdown = ref(0);
const timerInterval = ref(null);

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCountdown = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
};

const fetchExam = async () => {
  loading.value = true;

  try {
    const res = await api.get(`/exams/${route.params.id}`);
    exam.value = res.data;
    setupCountdown();
    loading.value = false;
  } catch (e) {
    console.error("Error loading exam:", e);

    if (e.response && e.response.status === 403) {
      error.value = e.response.data.message || "Sınav henüz başlamadı.";
    } else {
      error.value = e.response?.data?.message || "Sınav yüklenemedi";
    }

    loading.value = false;
  }
};

const setupCountdown = () => {
  const now = new Date();
  const start = new Date(exam.value.startTime);
  const end = new Date(exam.value.endTime);

  if (now < start) {
    countdown.value = Math.floor((start - now) / 1000);
    timerInterval.value = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timerInterval.value);
        countdown.value = 0;
      }
    }, 1000);
  } else if (now >= start && now < end) {
    // dikkat: < end
    countdown.value = 0;
    // Otomatik başlatmıyoruz, kullanıcı butonla başlatacak
  } else if (now >= end) {
    error.value = "Sınav süresi doldu. Artık sınava katılamazsınız.";
    loading.value = false;
  }
};

const startExam = async () => {
  if (new Date() > new Date(exam.value.endTime)) {
    error.value = "Sınav süresi doldu. Artık sınava katılamazsınız.";
    return;
  }
  
  try {
    loading.value = true;
    
    // Sınav başlatma API'sini çağır
    const response = await api.post(`/exams/${route.params.id}/start`);
    
    // Attempt bilgilerini localStorage'a kaydet
    const attemptData = {
      attemptId: response.data.attemptId,
      attemptNumber: response.data.attemptNumber,
      remainingAttempts: response.data.remainingAttempts
    };
    
    localStorage.setItem(`examAttempt_${route.params.id}`, JSON.stringify(attemptData));
    
    // ExamTakingView.vue sayfasına yönlendir
    router.push(`/exams/${route.params.id}/take`);
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Sınav başlatılırken bir hata oluştu';
    
    // Attempt limit hatası için warning toast, diğerleri için error toast
    if (err.response?.status === 403 && errorMessage.includes('maximum') && errorMessage.includes('attempt limit has been exceeded')) {
      showWarning(errorMessage);
    } else {
      showError(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/exams');
};

onBeforeUnmount(() => {
    if (timerInterval.value) clearInterval(timerInterval.value);
});

onMounted(() => {
    fetchExam();
});
</script>

<style lang="scss" scoped>
/* Loading & Error States */
.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #f44336;
}

/* New Exam Introduction Design */
.exam-student-container {
  min-height: 100vh !important;
  background: var(--bg-secondary) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
}

.exam-intro-new {
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
      background: #9ca3af !important;
    }
  }
}

/* Back Button */
.exam-header-section {
  margin-bottom: 20px !important;
  
  .back-button {
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    background: transparent !important;
    border: 2px solid var(--border-secondary) !important;
    color: var(--text-secondary) !important;
    padding: 8px 16px !important;
    border-radius: 8px !important;
    font-size: 0.95rem !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;

    &:hover {
      background: var(--bg-tertiary) !important;
      color: var(--text-primary) !important;
      border-color: var(--text-primary) !important;
    }

    .material-symbols-outlined {
      font-size: 20px !important;
    }
  }
}

@media (max-width: 768px) {
  .exam-intro-new {
    padding: 30px 20px !important;
  }

  .exam-details-grid {
    grid-template-columns: 1fr !important;
    gap: 20px !important;

    .detail-item:last-child {
      grid-column: span 1 !important;
    }
  }
}
</style>
