<template>
  <Modal :modelValue="isOpen" @update:modelValue="handleModalUpdate" title="Eğitmen Seç" :showCloseButton="true">
    <div>
      <div class="teacher-selection">
        <p class="modal-description">
          Seçilen öğrencileri aşağıdaki eğitmenlere atayabilirsiniz:
        </p>
        
        <div class="teacher-list">
          <div 
            v-for="teacher in teachers" 
            :key="teacher._id"
            :class="['teacher-item', { 'selected': selectedTeacherIds.includes(teacher._id) }]"
            @click="toggleTeacherSelection(teacher._id)"
          >
            <input 
              type="checkbox" 
              :checked="selectedTeacherIds.includes(teacher._id)"
              @change="toggleTeacherSelection(teacher._id)"
            />
            <span class="teacher-name">
              {{ teacher.name }} ({{ teacher.email }})
            </span>
          </div>
        </div>
        
        <div v-if="teachers.length === 0" class="no-teacher-msg">
          Sistemde eğitmen bulunamadı.
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button 
        styleType="primary" 
        :disabled="!selectedTeacherIds.length || loading"
        :loading="loading"
        @click="handleAssign"
      >
        Ata
      </Button>
      <Button styleType="danger" @click="close">İptal</Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import Button from '../ui/Button.vue'

interface Props {
  isOpen: boolean
  teachers: any[]
  selectedStudents: string[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'assign': [studentIds: string[], teacherIds: string[]]
}>()

const selectedTeacherIds = ref<string[]>([])

const toggleTeacherSelection = (teacherId: string) => {
  const index = selectedTeacherIds.value.indexOf(teacherId)
  if (index > -1) {
    selectedTeacherIds.value.splice(index, 1)
  } else {
    selectedTeacherIds.value.push(teacherId)
  }
}

const handleAssign = () => {
  if (selectedTeacherIds.value.length && props.selectedStudents.length) {
    emit('assign', props.selectedStudents, selectedTeacherIds.value)
  }
}

const close = () => {
  emit('update:isOpen', false)
  selectedTeacherIds.value = []
}

const handleModalUpdate = (value: boolean) => {
  emit('update:isOpen', value)
}

watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    selectedTeacherIds.value = []
  }
})
</script>

<style scoped lang="scss">
.teacher-selection {
  .modal-description {
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }
  
  .teacher-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    padding: 0.5rem;
    background: var(--bg-primary);
  }
  
  .teacher-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--text-primary);
    
    &:hover {
      background-color: var(--bg-secondary);
    }
    
    &.selected {
      background-color: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
    }
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border-secondary);
      border-radius: 4px;
      background: var(--bg-primary);
      cursor: pointer;
      
      &:checked {
        background: #667eea;
        border-color: #667eea;
      }
    }
  }
  
  .teacher-name {
    flex: 1;
    color: var(--text-primary);
  }
  
  .no-teacher-msg {
    color: #e74c3c;
    margin-top: 1rem;
    font-size: 1rem;
    text-align: center;
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-secondary);
  }
}
</style>
