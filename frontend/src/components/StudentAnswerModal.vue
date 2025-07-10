<template>
  <Modal
    v-model="showModal"
    :title="student.name + ' - Cevaplar ve Puanlama'"
    @update:modelValue="$emit('close')"
    :showCloseButton="true"
    :closeOnOverlayClick="true"
  >
    <div v-if="loading">Yükleniyor...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="answers && answers.length">
        <div v-for="(answer, idx) in answers" :key="idx" class="question-card-modal">
          <div class="question-header-modal">
            <h3>Soru {{ idx + 1 }}</h3>
            <span class="type-badge-modal">{{ getQuestionType(answer.type) }}</span>
          </div>
          <div class="question-text-modal">{{ answer.questionText }}</div>
          <!-- TRUE/FALSE -->
          <div v-if="answer.type === 'true_false'" class="options-modal">
            <div :class="['option-modal', isSelected(answer, 'true') ? 'selected-option-modal' : '']">
              <span class="option-letter-modal">A.</span>
              <span class="option-text-modal">Doğru</span>
            </div>
            <div :class="['option-modal', isSelected(answer, 'false') ? 'selected-option-modal' : '']">
              <span class="option-letter-modal">B.</span>
              <span class="option-text-modal">Yanlış</span>
            </div>
          </div>
          <!-- OPEN ENDED -->
          <div v-else-if="answer.type === 'open_ended'">
            <div class="student-answer-modal">Cevap: <span>{{ answer.response }}</span></div>
          </div>
          <!-- OTHER TYPES -->
          <div v-else-if="answer.options && answer.options.length > 0" class="options-modal">
            <div v-for="(option, optIndex) in answer.options" :key="optIndex"
              :class="['option-modal', isSelected(answer, option) ? 'selected-option-modal' : '']">
              <span class="option-letter-modal">{{ String.fromCharCode(65 + optIndex) }}.</span>
              <span class="option-text-modal">{{ option }}</span>
            </div>
          </div>
          <div class="question-meta-modal">
            <span class="difficulty-badge-modal">Zorluk: {{ getDifficultyLabel(answer.difficulty) }}</span>
          </div>
          <div class="score-section-modal">
            <label>Puan:</label>
            <input type="number" v-model.number="answer.score" min="0" max="100" />
          </div>
        </div>
      </div>
      <div v-else>Bu öğrenciye ait cevap bulunamadı.</div>
    </div>
    <template #footer>
      <div class="total-score-modal">
        <b>Toplam Puan:</b> {{ totalScore }}
      </div>
      <button class="save-btn" @click="saveScores">Puanları Kaydet</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Modal from './ui/Modal.vue';
import api from '../services/api';
const props = defineProps({
  student: { type: Object, required: true },
  examId: { type: String, required: true }
});
const emit = defineEmits(['close', 'scored']);

const loading = ref(true);
const error = ref('');
const answers = ref([]);
const showModal = ref(true);

const getQuestionType = (type) => {
  const types = {
    single_choice: 'Çoktan Tek Seçmeli',
    multiple_select: 'Çoktan Çok Seçmeli',
    open_ended: 'Kısa Cevap',
    true_false: 'Doğru/Yanlış',
  };
  return types[type] || type;
};
const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    easy: 'Kolay',
    medium: 'Orta',
    hard: 'Zor'
  };
  return difficultyMap[difficulty] || difficulty;
};
const isSelected = (answer, option) => {
  if (answer.type === 'multiple_select' && Array.isArray(answer.response)) {
    return answer.response.includes(option);
  }
  // true_false and single_choice: response can be string or boolean
  return answer.response === option || answer.response == option;
};

const fetchAnswers = async () => {
  loading.value = true;
  try {
    // Fetch both answers and exam questions
    const [answersRes, examRes] = await Promise.all([
      api.get(`/exams/${props.examId}/answers/${props.student._id}`),
      api.get(`/exams/${props.examId}`)
    ]);
    const questions = examRes.data.questions;
    // Merge type/difficulty/options/text into each answer
    answers.value = answersRes.data.answers.map(ans => {
      const q = questions.find(q => q._id === ans.questionId);
      return {
        ...ans,
        type: q?.type,
        difficulty: q?.difficulty,
        options: q?.options,
        questionText: q?.text
      };
    });
  } catch (e) {
    error.value = e.response?.data?.message || 'Cevaplar yüklenemedi';
  } finally {
    loading.value = false;
  }
};

const saveScores = async () => {
  try {
    await api.post(`/exams/${props.examId}/answers/${props.student._id}/score`, {
      scores: answers.value.map(a => ({ questionId: a.questionId, score: a.score }))
    });
    alert('Puanlar kaydedildi!');
    emit('scored');
    emit('close');
  } catch (e) {
    alert(e.response?.data?.message || 'Puanlar kaydedilemedi!');
  }
};

const totalScore = computed(() => answers.value.reduce((sum, a) => sum + (a.score || 0), 0));

watch(() => props.student, () => {
  if (props.student && props.examId) fetchAnswers();
}, { immediate: true });
</script>

<style scoped>
.question-card-modal {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px 18px;
  margin-bottom: 18px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.question-header-modal {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.question-header-modal h3 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}
.type-badge-modal {
  background: #1976d2;
  color: #fff;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 10px;
  margin-top: 2px;
  align-self: flex-start;
  white-space: nowrap;
}
.question-text-modal {
  font-weight: 500;
  margin-bottom: 12px;
  line-height: 1.4;
}
.options-modal {
  margin: 12px 0 0 0;
}
.option-modal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  margin: 7px 0;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  position: relative;
  font-weight: 400;
  color: #1976d2;
  transition: background 0.2s, color 0.2s;
}
.selected-option-modal {
  background: #1976d2 !important;
  color: #fff !important;
  font-weight: 600;
  border: 1.5px solid #1976d2;
}
.option-letter-modal {
  font-weight: bold;
  color: #1976d2;
  min-width: 20px;
}
.selected-option-modal .option-letter-modal {
  color: #fff;
}
.option-text-modal { flex: 1; }
.student-answer-modal {
  margin-bottom: 10px;
  font-size: 1.08em;
}
.question-meta-modal {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.97em;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
}
.difficulty-badge-modal {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #888;
}
.score-section-modal {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
input[type="number"] {
  width: 60px;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.total-score-modal {
  margin: 20px 0 10px 0;
  font-size: 1.1em;
  display: inline-block;
}
.save-btn {
  background: #1976d2;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 20px;
}
.save-btn:hover {
  background: #1565c0;
}
.error {
  color: #f44336;
  margin: 20px 0;
}
</style> 