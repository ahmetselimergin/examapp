<template>
<form @submit.prevent="handleSubmit" class="question-form">
     <div class="form-row">
          <Input 
               :label="t('questionBank.questionText')" 
               v-model="question.text" 
               :placeholder="t('questionBank.questionText')"
          />
     </div>
     <div class="form-row">
          <Select size="medium" :label="t('questionBank.questionType')" v-model="question.type" :options="questionTypes" :placeholder="t('questionBank.questionType')"></Select>

          <Select size="medium" :label="t('questionBank.difficulty')" v-model="question.difficulty" :options="difficultyOptions" :placeholder="t('questionBank.difficulty')"></Select>

     </div>

     <!-- Çoktan seçmeli için şıklar -->
     <div v-if="question.type === 'single_choice' || question.type === 'multiple_select'" class="options-section">
          <div class="flex flex-row space-end align-center w-full my-2">
               <Button type="button" styleType="primary" size="small" @click="addOption" icon="add">
                    {{ t('questionBank.addOption') }}
               </Button>
          </div>
          <div v-for="(option, idx) in question.options" :key="idx" class="option-row">
               <span v-if="question.type === 'single_choice'">
                    <input type="radio" :name="'correct-answer'" :value="String(idx)" v-model="question.correctAnswers" :disabled="!option" />
               </span>
               <span v-else-if="question.type === 'multiple_select'">
                    <input type="checkbox" :value="String(idx)" v-model="question.correctAnswers" :disabled="!option" />
               </span>
               <input v-model="question.options[idx]" :placeholder="t('questionBank.option')" class="option-input" />
               <button type="button" class="remove-option-btn" @click="removeOption(idx)">
                   
                    <span class="material-symbols-outlined">delete</span>
               </button>
          </div>
     </div>

     <!-- Doğru/Yanlış için -->
     <div v-if="question.type === 'true_false'" class="form-row">
          <Select 
               size="medium" 
               :label="t('questionBank.correctAnswer')" 
               v-model="question.correctAnswers" 
               :options="trueFalseOptions" 
               :placeholder="t('questionBank.correctAnswer')"
          />
     </div>

     <!-- Açık Uçlu için sadece doğru cevap -->
     <div v-if="['open_ended'].includes(question.type)" class="form-row">
          <Input 
               :label="t('questionBank.correctAnswer')" 
               v-model="question.correctAnswers" 
               :placeholder="t('questionBank.correctAnswer')"
          />
     </div>

</form>
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
          showError('Lütfen soru metnini giriniz!');
          return;
     }
     
     // Validation: Check if correct answer is selected for choice questions
     if (['single_choice', 'multiple_select'].includes(question.value.type)) {
          if (question.value.type === 'single_choice') {
               if (question.value.correctAnswers === '' || question.value.correctAnswers === null || question.value.correctAnswers === undefined) {
                    showError('Lütfen doğru şıkkı seçiniz!');
                    return;
               }
          } else if (question.value.type === 'multiple_select') {
               if (!Array.isArray(question.value.correctAnswers) || question.value.correctAnswers.length === 0) {
                    showError('Lütfen en az bir doğru şık seçiniz!');
                    return;
               }
          }
          
          // Check if all options are filled
          const emptyOptions = question.value.options.filter(opt => !opt || opt.trim() === '');
          if (emptyOptions.length > 0) {
               showError('Lütfen tüm şıkları doldurunuz!');
               return;
          }
     }
     
     // Validation: Check if correct answer is provided for true/false questions
     if (question.value.type === 'true_false') {
          if (!question.value.correctAnswers || question.value.correctAnswers === '') {
               showError('Lütfen doğru cevabı seçiniz!');
               return;
          }
     }
     
     // Validation: Check if correct answer is provided for open-ended questions
     if (question.value.type === 'open_ended') {
          if (!question.value.correctAnswers || question.value.correctAnswers.trim() === '') {
               showError('Lütfen doğru cevabı giriniz!');
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

.question-form {
     max-width: 1200px;
     margin: 0 auto;
     padding: 20px;
     background: white;
     border-radius: 8px;
     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
     display: flex;
     gap: 16px;
     align-items: flex-start;
     margin-bottom: 24px;
     
     &:first-child {
          flex-direction: column;
          align-items: stretch;
     }
}

.difficulty-select {
     display: flex;
     flex-direction: column;
     min-width: 180px;
}

.options-section {
     margin-bottom: 24px;
     position: relative;
     background: #f9fafb;
     padding: 20px;
     border-radius: 8px;
     border: 1px solid #e5e7eb;
}

.options-label {
     font-weight: 500;
     font-size: 14px;
     color: $darkgrey;
     margin-bottom: 8px;
     display: block;
}

.add-option-btn {
     position: absolute;
     right: 0;
     top: 0;
     background: #1976d2;
     color: #fff;
     border: none;
     border-radius: 4px;
     padding: 4px 12px;
     font-size: 14px;
     cursor: pointer;
     margin-bottom: 8px;
}

.option-row {
     display: flex;
     align-items: center;
     gap: 12px;
     margin-bottom: 12px;
     padding: 12px;
     background: white;
     border-radius: 6px;
     border: 1px solid #e5e7eb;
}

.option-input {
     flex: 1;
     padding: 6px 10px;
     border: 1px solid #ccc;
     border-radius: 4px;
}

.remove-option-btn {
     background: none;
     border: none;
     color: #e53935;
     font-size: 18px;
     cursor: pointer;
     margin-left: 4px;
}


.save-btn {
     background: #1976d2;
     color: #fff;
     border: none;
     border-radius: 4px;
     padding: 8px 24px;
     font-size: 16px;
     cursor: pointer;
     margin-top: 16px;
}
</style>
