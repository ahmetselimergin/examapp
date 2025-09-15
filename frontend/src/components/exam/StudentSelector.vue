<template>
  <div class="form-card">
    <div class="step-header">
      <h3>Öğrenci Ataması</h3>
      <div class="selected-count">
        Seçilen: {{ selectedStudents.length }} öğrenci
      </div>
    </div>

    <FilterBar
      :search-placeholder="'Ad veya e-posta ile ara...'"
      @search-change="handleSearchChange"
    />

    <div v-if="loading" class="loading">
      Öğrenciler yükleniyor...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="students-grid">
      <div 
        v-for="student in filteredStudents" 
        :key="student._id"
        :class="['student-card', { 'selected': isStudentSelected(student._id) }]"
        @click="toggleStudentSelection(student._id)"
      >
        <div class="student-avatar">
          {{ student.name.charAt(0).toUpperCase() }}
        </div>
        <div class="student-info">
          <div class="student-name">{{ student.name }}</div>
          <div class="student-email">{{ student.email }}</div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <Button 
        @click="$emit('previous')" 
        styleType="lightgrey" 
        size="medium" 
        :text="'Geri'"
      />
      <Button 
        @click="$emit('finish')" 
        styleType="primary" 
        size="medium" 
        :text="'Sınavı Oluştur'"
        :loading="creating"
        :disabled="selectedStudents.length === 0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApi } from '../../composables/useApi'
import FilterBar from '../ui/FilterBar.vue'
import Button from '../ui/Button.vue'

interface Props {
  selectedStudents: string[]
  loading?: boolean
  error?: string
  creating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
  creating: false
})

const emit = defineEmits<{
  'update:selectedStudents': [students: string[]]
  'search-change': [query: string]
  'previous': []
  'finish': []
}>()

const { data: students, fetchData: loadStudents } = useApi()
const searchQuery = ref('')

const filteredStudents = computed(() => {
  let filtered = students.value.filter(s => s.role === 'student')
  
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) || 
      s.email.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

const isStudentSelected = (studentId: string) => {
  return props.selectedStudents.includes(studentId)
}

const toggleStudentSelection = (studentId: string) => {
  const newSelection = [...props.selectedStudents]
  const index = newSelection.indexOf(studentId)
  
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(studentId)
  }
  
  emit('update:selectedStudents', newSelection)
}

const handleSearchChange = (query: string) => {
  searchQuery.value = query
  emit('search-change', query)
}

const loadStudentsData = async () => {
  try {
    await loadStudents('/auth/admin/users')
  } catch (error) {
    console.error('Öğrenciler yüklenirken hata oluştu:', error)
  }
}

// Load students on mount
loadStudentsData()
</script>

<style scoped lang="scss">
.form-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.selected-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1976d2;
    background: #f0f8ff;
  }

  &.selected {
    border-color: #1976d2;
    background: #e3f2fd;
  }
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.student-email {
  font-size: 14px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #f44336;
}

@media (max-width: 768px) {
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
