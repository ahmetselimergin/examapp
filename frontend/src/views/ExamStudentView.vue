<template>
  <div class="exam-student-container">
    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Sınav başlamadan önce -->
      <div v-if="!examStarted">
        <div class="exam-info-card">
          <h2>{{ exam.title }}</h2>
          <p class="description">{{ exam.description }}</p>
          <div class="exam-info-grid">
            <div class="info-item">
              <span class="material-symbols-outlined">schedule</span>
              <div>
                <div class="info-label">Başlangıç</div>
                <div class="info-value">{{ formatDateTime(exam.startTime) }}</div>
              </div>
            </div>
            <div class="info-item">
              <span class="material-symbols-outlined">schedule</span>
              <div>
                <div class="info-label">Bitiş</div>
                <div class="info-value">{{ formatDateTime(exam.endTime) }}</div>
              </div>
            </div>
            <div class="info-item">
              <span class="material-symbols-outlined">timer</span>
              <div>
                <div class="info-label">Süre</div>
                <div class="info-value">{{ exam.duration }} dakika</div>
              </div>
            </div>
            <div class="info-item">
              <span class="material-symbols-outlined">quiz</span>
              <div>
                <div class="info-label">Soru Sayısı</div>
                <div class="info-value">{{ exam.questions?.length || 0 }}</div>
              </div>
            </div>
          </div>
          <div class="rules-section">
            <h3>Sınav Kuralları</h3>
            <ul>
              <li>Sınav süresince sayfayı yenilemeyin veya sekmeyi kapatmayın.</li>
              <li>Kopya çekmek yasaktır.</li>
              <li>Süre bitince sınav otomatik olarak kapanır ve cevaplarınız kaydedilir.</li>
              <li>Her seferde sadece bir soruyu görebilirsiniz.</li>
            </ul>
          </div>
          <div class="countdown-section">
            <span v-if="countdown > 0">
              Sınavın başlamasına kalan süre: <b>{{ formatCountdown(countdown) }}</b>
            </span>
            <span v-else>
              Sınav başlamak için hazır!
            </span>
          </div>
          <div class="start-btn-section">
            <Button 
              type="button"
              styleType="primary"
              size="large"
              :disabled="countdown > 0" 
              @click="startExam"
              text="Sınava Başla"
            />
          </div>
        </div>
      </div>
      <!-- Sınav başladıysa -->
      <div v-else class="exam-questions-fullscreen">
        <div class="exam-header">
          <h2>{{ exam.title }}</h2>
          <div class="timer">Kalan Süre: <b>{{ formatCountdown(remainingTime) }}</b></div>
        </div>
        <div class="question-section">
          <div class="question-index">Soru {{ currentQuestionIndex + 1 }} / {{ exam.questions.length }}</div>
          <div class="question-card">
            <div class="question-text">{{ currentQuestion.text }}</div>
            <div v-if="currentQuestion.type === 'single_choice'">
              <div v-for="(option, idx) in currentQuestion.options" :key="idx" class="option-row">
                <input type="radio" :id="'opt'+idx" :name="'q'+currentQuestionIndex" :value="option" v-model="answers[currentQuestionIndex]" />
                <label :for="'opt'+idx">{{ option }}</label>
              </div>
            </div>
            <div v-else-if="currentQuestion.type === 'multiple_select'">
              <div v-for="(option, idx) in currentQuestion.options" :key="idx" class="option-row">
                <input type="checkbox" :id="'opt'+idx" :value="option" v-model="answers[currentQuestionIndex]" />
                <label :for="'opt'+idx">{{ option }}</label>
              </div>
            </div>
            <div v-else-if="currentQuestion.type === 'true_false'">
              <div class="option-row">
                <input type="radio" :id="'true'" value="true" v-model="answers[currentQuestionIndex]" />
                <label for="true">Doğru</label>
              </div>
              <div class="option-row">
                <input type="radio" :id="'false'" value="false" v-model="answers[currentQuestionIndex]" />
                <label for="false">Yanlış</label>
              </div>
            </div>
            <div v-else-if="currentQuestion.type === 'open_ended'">
              <textarea v-model="answers[currentQuestionIndex]" placeholder="Cevabınızı yazınız..." rows="4"></textarea>
            </div>
          </div>
        </div>
        <div class="question-nav">
          <Button 
            type="button"
            styleType="primary"
            size="medium"
            @click="prevQuestion" 
            :disabled="currentQuestionIndex === 0"
            text="Önceki"
          />
          <Button 
            type="button"
            styleType="primary"
            size="medium"
            @click="nextQuestion" 
            :disabled="currentQuestionIndex === exam.questions.length - 1"
            text="Sonraki"
          />
        </div>
        <div class="finish-section">
          <Button 
            type="button"
            styleType="primary"
            size="medium"
            @click="finishExam"
            text="Sınavı Bitir"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>import {
  ref,
  onMounted,
  computed,
  watch,
  onBeforeUnmount
}

from 'vue';

import {
  useRoute,
  useRouter
}

from 'vue-router';
import api from '../services/api';
import Button from '../components/ui/Button.vue';

const route=useRoute();
const router=useRouter();

const exam=ref( {}

);
const loading=ref(true);
const error=ref('');
const examStarted=ref(false);
const examFinished=ref(false);
const countdown=ref(0);
const remainingTime=ref(0);
const timerInterval=ref(null);
const answers=ref([]);
const currentQuestionIndex=ref(0);

const currentQuestion=computed(()=> {
    if ( !exam.value.questions) return {}

    ;

    return exam.value.questions[currentQuestionIndex.value] || {}

    ;
  }

);

const formatDateTime=(date)=> {
  return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }

  );
}

;

const formatCountdown = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
};

const updateRemainingTime = () => {
  const now = new Date();
  const start = new Date(exam.value.startTime);
  const duration = exam.value.duration || 60;
  const examEnd = new Date(start.getTime() + duration * 60000);
  const remaining = Math.floor((examEnd - now) / 1000);
  remainingTime.value = remaining > 0 ? remaining : 0;
};

const fetchExam=async ()=> {
  loading.value=true;

  try {
    console.log('Fetching exam...');

    const res = await api.get(`/exams/${route.params.id}`);
    exam.value=res.data;
    answers.value=Array(res.data.questions.length).fill(null);
    setupCountdown();
    loading.value=false;
    console.log('Exam loaded:', res.data);
  }

  catch (e) {
    console.error('Error loading exam:', e);

    if (e.response && e.response.status===403) {
      error.value=e.response.data.message || "Sınav henüz başlamadı.";
    }

    else {
      error.value=e.response?.data?.message || 'Sınav yüklenemedi';
    }

    loading.value=false;
  }
}

;

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
  } else if (now >= start && now < end) { // dikkat: < end
    countdown.value = 0;
    startExam();
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
  examStarted.value=true;
  updateRemainingTime();
  // Cevap tiplerini başlat
  answers.value=exam.value.questions.map(q=> {
      if (q.type==='multiple_select') return [];
      else return null;
    }

  );

  // Fullscreen
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }

  // Sayfa/sekme kapatılırsa uyarı
  window.onbeforeunload=(e)=> {
    if ( !examFinished.value) {
      e.preventDefault();
      e.returnValue='';
      return '';
    }
  }

  ;

  // Route değişikliğini engelle
  router.beforeEach((to, from, next)=> {
      if (examStarted.value && !examFinished.value) {
        alert('Sınavı bitirmeden ayrılamazsınız!');
        next(false);
      }

      else {
        next();
      }
    }

  );

  timerInterval.value=setInterval(()=> {
      updateRemainingTime();

      if (remainingTime.value <=0) {
        clearInterval(timerInterval.value);
        finishExam();
      }
    }

    , 1000);
}

;

const nextQuestion=()=> {
  if (currentQuestionIndex.value < exam.value.questions.length - 1) {
    currentQuestionIndex.value++;
  }
}

;

const prevQuestion=()=> {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}

;

const finishExam = async () => {
  try {
    // Cevapları backend'e kaydet
    const answersToSubmit = answers.value.map((answer, index) => ({
      questionId: exam.value.questions[index]._id,
      response: answer
    }));

    await api.post(`/exams/${route.params.id}/submit-answers`, {
      answers: answersToSubmit
    });

    examFinished.value = true;

    // Fullscreen'den çık
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }

    window.onbeforeunload = null;
    alert('Sınavı bitirdiniz! Cevaplarınız kaydedildi.');
    router.push('/exams');
  } catch (error) {
    console.error('Error submitting answers:', error);
    alert('Cevaplar kaydedilemedi! Lütfen tekrar deneyin.');
  }
};

;

const setFullscreenClass=()=> {
  document.body.classList.add('exam-fullscreen');
}

;

const removeFullscreenClass=()=> {
  document.body.classList.remove('exam-fullscreen');
}

;

watch(examStarted, (val)=> {
    if (val) setFullscreenClass();
    else removeFullscreenClass();
  }

);

onBeforeUnmount(()=> {
    removeFullscreenClass();
    window.onbeforeunload=null;
    if (timerInterval.value) clearInterval(timerInterval.value);
  }

);

watch(countdown, (val)=> {
    if (val===0 && !examStarted.value) {
      // Sınav başlatılabilir
    }
  }

);

onMounted(()=> {
    fetchExam();
  }

);

</script><style lang="scss"scoped>.exam-student-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 30px 0;
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

.exam-info-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.exam-info-card h2 {
  margin-bottom: 10px;
}

.exam-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.info-label {
  font-size: 12px;
  color: #888;
}

.info-value {
  font-weight: 500;
  color: #333;
}

.rules-section {
  margin: 20px 0;
  background: #f7f7fa;
  border-radius: 8px;
  padding: 16px;
}

.rules-section h3 {
  margin-bottom: 10px;
}

.countdown-section {
  margin: 20px 0;
  font-size: 1.1em;
  color: #1976d2;
}

.start-btn-section {
  text-align: center;
}

.start-btn {
  background: #1976d2;
  color: white;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.start-btn:disabled {
  background: #b0b0b0;
  cursor: not-allowed;
}

.exam-questions-fullscreen {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.timer {
  font-size: 1.1em;
  color: #1976d2;
  font-weight: 600;
}

.question-section {
  margin-bottom: 30px;
}

.question-index {
  font-size: 1.1em;
  color: #888;
  margin-bottom: 10px;
}

.question-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 10px;
}

.question-text {
  font-weight: 500;
  margin-bottom: 16px;
  font-size: 1.1em;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ccc;
  padding: 8px;
  font-size: 1em;
}

.question-nav {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.question-nav button {
  background: #1976d2;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.question-nav button:disabled {
  background: #b0b0b0;
  cursor: not-allowed;
}

.finish-section {
  text-align: center;
  margin-top: 30px;
}

.finish-btn {
  background: #43a047;
  color: white;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.finish-btn:hover {
  background: #388e3c;
}

</style>