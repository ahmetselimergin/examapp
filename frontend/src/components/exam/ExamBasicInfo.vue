<template>
  <div class="form-card">
    <h3>Sınav Bilgileri</h3>
    <form @submit.prevent="handleSubmit" class="exam-form">
      <div class="form-group">
        <Input 
          :label="'Sınav Adı'" 
          v-model="form.title.value" 
          :placeholder="'Sınav adını girin'"
          required
        />
      </div>
      
      <div class="form-group">
        <Input 
          :label="'Açıklama'" 
          v-model="form.description.value" 
          :placeholder="'Sınav açıklaması girin'"
          type="textarea"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <Input 
            :label="'Başlangıç Zamanı'" 
            v-model="form.startTime.value" 
            type="datetime-local"
            required
          />
        </div>
        
        <div class="form-group">
          <Input 
            :label="'Bitiş Zamanı'" 
            v-model="form.endTime.value" 
            type="datetime-local"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <Input 
          :label="'Sınav Süresi (Dakika)'" 
          v-model="form.duration.value" 
          type="number"
          :placeholder="'60'"
          min="1"
          required
        />
      </div>

      <div class="form-actions">
        <Button 
          type="submit" 
          styleType="primary" 
          size="medium" 
          :text="'Devam Et'"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '../../composables/useForm'
import { validators } from '../../utils/validationUtils'
import Input from '../ui/Input.vue'
import Button from '../ui/Button.vue'

interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'submit': [data: any]
}>()

// Initialize with current datetime for startTime and endTime
const now = new Date();
const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
const endTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Day after tomorrow

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const { form, validateForm, getFormData, errors } = useForm({
  title: { value: '', required: true, rules: [validators.required] },
  description: { value: '' },
  startTime: { value: formatDateTimeLocal(startTime), required: true, rules: [validators.required] },
  endTime: { value: formatDateTimeLocal(endTime), required: true, rules: [validators.required] },
  duration: { value: 60, required: true, rules: [validators.required, validators.min(1)] }
})

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', getFormData())
  }
}
</script>

<style scoped lang="scss">
.form-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.exam-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
