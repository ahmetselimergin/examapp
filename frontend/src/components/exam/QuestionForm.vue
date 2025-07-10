<template>
<form @submit.prevent="handleSubmit" class="question-form">
     <div class="form-row">
          <Input :label="t('questionBank.questionText')" size="medium" v-model="question.text" :placeholder="t('questionBank.questionText')" />
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
                    <span aria-hidden="true">✖</span>
               </button>
          </div>
     </div>

     <!-- Doğru/Yanlış için -->
     <div v-if="question.type === 'true_false'">
          <label>{{ t('questionBank.trueFalse') }}</label>
          <select v-model="question.correctAnswers">
               <option value="true">{{ t('questionBank.true') }}</option>
               <option value="false">{{ t('questionBank.false') }}</option>
          </select>
     </div>

     <!-- Açık Uçlu için sadece doğru cevap -->
     <div v-if="['open_ended'].includes(question.type)">
          <label>{{ t('questionBank.correctAnswer') }}</label>
          <input v-model="question.correctAnswers" />
     </div>

     <Button type="submit" styleType="primary" size="medium" :text="t('common.save')" />
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

const { t } = useI18n();

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

const emit = defineEmits(['save']);

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

               question.value = {
                    ...defaultQuestion,
                    ...val,
                    correctAnswers: correctAnswers
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
</script>

<style lang="scss" scoped>
@import "../../assets/styles/_framework.scss";

.question-form {
     max-width: 100%;
     margin: 0 auto;
}

.form-row {
     display: flex;
     gap: 16px;
     align-items: center;
}

.difficulty-select {
     display: flex;
     flex-direction: column;
     min-width: 180px;
}

.options-section {
     margin-bottom: 16px;
     position: relative;
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
     gap: 8px;
     margin-bottom: 8px;
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
