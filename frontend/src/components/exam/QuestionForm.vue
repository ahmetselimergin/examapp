<template>
  <div class="question-form-container">
    <form @submit.prevent="handleSubmit" class="question-form">
      <!-- Basic Information Section -->
      <div class="form-section">
        <h3 class="section-title">
          <span class="material-symbols-outlined">quiz</span>
          {{ t('questionBank.questionText') }}
        </h3>
        <div class="form-group">
          <Input 
            :label="t('questionBank.questionText')" 
            v-model="question.text" 
            :placeholder="t('questionBank.questionText')"
            size="large"
          />
        </div>
      </div>

      <!-- Question Configuration Section -->
      <div class="form-section">
        <h3 class="section-title">
          <span class="material-symbols-outlined">settings</span>
          {{ t('questionBank.configuration') }}
        </h3>
        <div class="form-row">
          <Select 
            size="large" 
            :label="t('questionBank.questionType')" 
            v-model="question.type" 
            :options="questionTypes" 
            :placeholder="t('questionBank.questionType')"
          />
          <Select 
            size="large" 
            :label="t('questionBank.difficulty')" 
            v-model="question.difficulty" 
            :options="difficultyOptions" 
            :placeholder="t('questionBank.difficulty')"
          />
        </div>
      </div>

      <!-- Multiple Choice Options Section -->
      <div v-if="question.type === 'single_choice' || question.type === 'multiple_select'" class="form-section options-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="material-symbols-outlined">list</span>
            {{ t('questionBank.options') }}
          </h3>
          <Button 
            type="button" 
            styleType="primary" 
            size="medium" 
            @click="addOption" 
            icon="add"
            :text="t('questionBank.addOption')"
          />
        </div>
        
        <div class="options-list">
          <div v-for="(option, idx) in question.options" :key="idx" class="option-card">
            <div class="option-marker">
              <span class="option-letter">{{ String.fromCharCode(65 + idx) }}</span>
            </div>
            <div class="option-content">
              <input 
                v-model="question.options[idx]" 
                :placeholder="`${t('questionBank.option')} ${String.fromCharCode(65 + idx)}`" 
                class="option-input" 
              />
            </div>
            <div class="option-controls">
              <div class="correct-answer-control">
                <input 
                  v-if="question.type === 'single_choice'"
                  type="radio" 
                  :name="'correct-answer'" 
                  :value="String(idx)" 
                  v-model="question.correctAnswers" 
                  :disabled="!option"
                  class="correct-radio"
                />
                <input 
                  v-else-if="question.type === 'multiple_select'"
                  type="checkbox" 
                  :value="String(idx)" 
                  v-model="question.correctAnswers" 
                  :disabled="!option"
                  class="correct-checkbox"
                />
                <label class="correct-label">
                  {{ question.type === 'single_choice' ? t('questionBank.correctAnswer') : t('questionBank.correct') }}
                </label>
              </div>
              <button 
                type="button" 
                class="remove-option-btn" 
                @click="removeOption(idx)"
                :disabled="question.options.length <= 2"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- True/False Section -->
      <div v-if="question.type === 'true_false'" class="form-section">
        <h3 class="section-title">
          <span class="material-symbols-outlined">check_circle</span>
          {{ t('questionBank.correctAnswer') }}
        </h3>
        <div class="form-group">
          <Select 
            size="large" 
            :label="t('questionBank.correctAnswer')" 
            v-model="question.correctAnswers" 
            :options="trueFalseOptions" 
            :placeholder="t('questionBank.correctAnswer')"
          />
        </div>
      </div>

      <!-- Open Ended Section -->
      <div v-if="['open_ended'].includes(question.type)" class="form-section">
        <h3 class="section-title">
          <span class="material-symbols-outlined">edit_note</span>
          {{ t('questionBank.correctAnswer') }}
        </h3>
        <div class="form-group">
          <Input 
            :label="t('questionBank.correctAnswer')" 
            v-model="question.correctAnswers" 
            :placeholder="t('questionBank.correctAnswer')"
            size="large"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {
     ref,
     watch,
     toRefs
} from 'vue';
import Input from '../ui/Input.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import { useI18n } from 'vue-i18n';
import { useToast } from '../../composables/useToast';

const { t } = useI18n();
const { showError } = useToast();

const props = defineProps({
     initialQuestion: {
          type: Object,
          default: null
     }
});

const questionTypes = [{
          value: 'single_choice',
          label: t('questionBank.singleChoice')
     },
     {
          value: 'multiple_select',
          label: t('questionBank.multipleSelect')
     },
     {
          value: 'true_false',
          label: t('questionBank.trueFalse')
     },
     {
          value: 'open_ended',
          label: t('questionBank.openEnded')
     }
];

const difficultyOptions = [{
          value: 'easy',
          label: t('questionBank.easy')
     },
     {
          value: 'medium',
          label: t('questionBank.medium')
     },
     {
          value: 'hard',
          label: t('questionBank.hard')
     }
];

const trueFalseOptions = [{
          value: 'true',
          label: t('questionBank.true')
     },
     {
          value: 'false',
          label: t('questionBank.false')
     }
];

const emit = defineEmits(['save', 'cancel']);

const defaultQuestion = {
     text: '',
     type: 'single_choice',
     options: ['', ''],
     correctAnswers: '',
     difficulty: 'easy',
};

const question = ref({
     ...defaultQuestion
});

// Eğer initialQuestion gelirse formu doldur
watch(
     () => props.initialQuestion,
     (val) => {
          if (val) {
               // Convert correctAnswers to array format for multiple choice questions
               let correctAnswers = val.correctAnswers;
               if (['single_choice', 'multiple_select'].includes(val.type)) {
                    if (Array.isArray(correctAnswers)) {
                         correctAnswers = correctAnswers.map(answer => 
                              val.options.findIndex(opt => opt === answer)
                         ).filter(idx => idx !== -1);
                         // For single choice, take only the first correct answer
                         if (val.type === 'single_choice' && correctAnswers.length > 0) {
                              correctAnswers = correctAnswers[0].toString();
                         }
                    } else if (typeof correctAnswers === 'string') {
                         const idx = val.options.findIndex(opt => opt === correctAnswers);
                         correctAnswers = idx !== -1 ? (val.type === 'single_choice' ? idx.toString() : [idx]) : '';
                    } else {
                         correctAnswers = val.type === 'single_choice' ? '' : [];
                    }
               }

               // Create editorData from plain text if not available
               let editorData = val.editorData;
               if (!editorData && val.text) {
                    editorData = {
                         blocks: [
                              {
                                   type: 'paragraph',
                                   data: {
                                        text: val.text
                                   }
                              }
                         ]
                    };
               }

               question.value = {
                    ...defaultQuestion,
                    ...val,
                    correctAnswers: correctAnswers,
                    editorData: editorData
               };
               
               // Ensure at least two empty options for multiple choice questions
               if (['single_choice', 'multiple_select'].includes(val.type) && 
                   (!question.value.options || question.value.options.length < 2)) {
                    question.value.options = ['', ''];
               }
          } else {
               question.value = {
                    ...defaultQuestion
               };
          }
     }, {
          immediate: true
     }
);


const addOption = () => {
     question.value.options.push('');
};
const removeOption = (idx) => {
     question.value.options.splice(idx, 1);
     // correctAnswers'dan da çıkar
     if (Array.isArray(question.value.correctAnswers)) {
          question.value.correctAnswers = question.value.correctAnswers.filter(i => i !== idx);
     } else if (typeof question.value.correctAnswers === 'number' && question.value.correctAnswers === idx) {
          question.value.correctAnswers = null;
     }
     // Kalan indexleri güncelle (ör: [0,2,3] -> [0,1,2] gibi)
     if (Array.isArray(question.value.correctAnswers)) {
          question.value.correctAnswers = question.value.correctAnswers.map(i => i > idx ? i - 1 : i);
     }
};

const handleSubmit = () => {
     // Validation: Check if question text is provided
     if (!question.value.text || question.value.text.trim() === '') {
          showError(t('questionBank.validation.questionTextRequired'));
          return;
     }
     
     // Validation: Check if correct answer is selected for choice questions
     if (['single_choice', 'multiple_select'].includes(question.value.type)) {
          if (question.value.type === 'single_choice') {
               if (question.value.correctAnswers === '' || question.value.correctAnswers === null || question.value.correctAnswers === undefined) {
                    showError(t('questionBank.validation.correctAnswerRequired'));
                    return;
               }
          } else if (question.value.type === 'multiple_select') {
               if (!Array.isArray(question.value.correctAnswers) || question.value.correctAnswers.length === 0) {
                    showError(t('questionBank.validation.multipleCorrectRequired'));
                    return;
               }
          }
          
          // Check if all options are filled
          const emptyOptions = question.value.options.filter(opt => !opt || opt.trim() === '');
          if (emptyOptions.length > 0) {
               showError(t('questionBank.validation.allOptionsRequired'));
               return;
          }
     }
     
     // Validation: Check if correct answer is provided for true/false questions
     if (question.value.type === 'true_false') {
          if (!question.value.correctAnswers || question.value.correctAnswers === '') {
               showError(t('questionBank.validation.correctAnswerRequired'));
               return;
          }
     }
     
     // Validation: Check if correct answer is provided for open-ended questions
     if (question.value.type === 'open_ended') {
          if (!question.value.correctAnswers || question.value.correctAnswers.trim() === '') {
               showError(t('questionBank.validation.correctAnswerRequired'));
               return;
          }
     }
     
     let correct = question.value.correctAnswers;
     if (['single_choice', 'multiple_select'].includes(question.value.type)) {
          // Convert indices to option texts
          if (question.value.type === 'single_choice') {
               correct = question.value.options[Number(correct)];
          } else if (Array.isArray(correct)) {
               correct = correct.map(idx => question.value.options[Number(idx)]).filter(Boolean);
          } else {
               correct = [];
          }
     }
     
     // Ensure editorData is included in the payload
     const { _id, ...rest } = question.value;
     const payload = JSON.parse(JSON.stringify({
          ...rest,
          correctAnswers: correct,
          _id
     }));
     
     console.log("Kayıt edilecek soru:", payload);
     emit('save', payload);
     
     if (!props.initialQuestion) {
          question.value = {
               ...defaultQuestion
          };
     }
};

// Expose methods to parent component
defineExpose({
     handleSubmit
});
</script>

<style lang="scss" scoped>
@import "../../assets/styles/_framework.scss";

.question-form-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
}

.question-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: var(--border-primary);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-secondary);

  .material-symbols-outlined {
    font-size: 22px;
    color: #667eea;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  .section-title {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

/* Options Section */
.options-section {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border: 2px solid var(--border-secondary);
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.1);
  }
}

.option-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.option-letter {
  font-size: 16px;
  font-weight: 600;
}

.option-content {
  flex: 1;
}

.option-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  font-size: 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.option-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.correct-answer-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-secondary);
}

.correct-radio,
.correct-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.correct-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
  cursor: pointer;
}

.remove-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #fecaca;
    border-color: #f87171;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
}

/* Dark mode specific styles */
[data-theme="dark"] {
  .option-card {
    background: var(--bg-secondary);
    
    &:hover {
      background: var(--bg-primary);
    }
  }

  .remove-option-btn {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.2);
    
    &:hover:not(:disabled) {
      background: rgba(220, 38, 38, 0.2);
      border-color: rgba(220, 38, 38, 0.3);
    }
  }

  .correct-answer-control {
    background: var(--bg-tertiary);
    border-color: var(--border-tertiary);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .question-form-container {
    padding: 0 16px;
  }

  .form-section {
    padding: 20px;
  }

  .section-title {
    font-size: 16px;
    
    .material-symbols-outlined {
      font-size: 20px;
    }
  }

  .option-card {
    padding: 12px;
    gap: 12px;
  }

  .option-marker {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .option-controls {
    gap: 12px;
  }

  .remove-option-btn {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .option-card {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .option-controls {
    justify-content: space-between;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
