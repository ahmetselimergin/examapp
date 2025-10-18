<template>
  <div class="form-card">
    <div class="step-header">
      <h3>{{ t('exam.questionSelection') }}</h3>
      <div class="selected-count">
        {{ t('exam.selected') }}: {{ selectedQuestions.length }} {{ t('exam.questions') }}
      </div>
    </div>

    <FilterBar
      :search-placeholder="t('exam.searchInQuestionText')"
      @search-change="handleSearchChange"
    >
      <template #filters>
        <Select 
          :label="t('questionBank.type')" 
          v-model="questionTypeFilter" 
          :options="questionTypeOptions"
        />
        
        <Select 
          :label="t('questionBank.difficulty')" 
          v-model="difficultyFilter" 
          :options="difficultyOptions"
        />
      </template>
    </FilterBar>

    <div v-if="loading" class="loading">
      {{ t('exam.loadingQuestions') }}
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="questions-grid">
      <div 
        v-for="question in filteredQuestions" 
        :key="question._id"
        :class="['question-card', { 'selected': isQuestionSelected(question._id) }]"
        @click="toggleQuestionSelection(question._id)"
      >
        <div class="question-header">
          <StatusBadge :status="question.type" type="question" />
          <StatusBadge :status="question.difficulty" type="question" />
        </div>
        
        <div class="question-text">{{ question.text }}</div>
        
        <div class="question-options" v-if="question.options && question.options.length > 0">
          <div v-for="(option, idx) in question.options.slice(0, 3)" :key="idx" class="option">
            {{ option }}
          </div>
          <div v-if="question.options.length > 3" class="more-options">
            +{{ question.options.length - 3 }} {{ t('exam.moreOptions') }}
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <Button 
        @click="$emit('previous')" 
        styleType="lightgrey" 
        size="medium" 
        :text="t('common.previous')"
      />
      <Button 
        @click="$emit('next')" 
        styleType="primary" 
        size="medium" 
        :text="t('common.next')"
        :disabled="selectedQuestions.length === 0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useApi } from '../../composables/useApi'
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from '../../utils/constants'
import { useI18n } from 'vue-i18n'
import FilterBar from '../ui/FilterBar.vue'
import Select from '../ui/Select.vue'
import Button from '../ui/Button.vue'
import StatusBadge from '../ui/StatusBadge.vue'

const { t } = useI18n()

interface Props {
  selectedQuestions: string[]
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: ''
})

const emit = defineEmits<{
  'update:selectedQuestions': [questions: string[]]
  'search-change': [query: string]
  'filter-change': [filters: any[]]
  'previous': []
  'next': []
}>()

const { data: questions, fetchData: loadQuestions } = useApi()

const questionTypeFilter = ref('')
const difficultyFilter = ref('')
const searchQuery = ref('')

const questionTypeOptions = computed(() => 
  QUESTION_TYPES.map(type => ({
    label: t(type.labelKey),
    value: type.value
  }))
)

const difficultyOptions = computed(() =>
  DIFFICULTY_LEVELS.map(level => ({
    label: t(level.labelKey),
    value: level.value
  }))
)

const filteredQuestions = computed(() => {
  let filtered = questions.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(q => 
      q.text.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (questionTypeFilter.value) {
    filtered = filtered.filter(q => q.type === questionTypeFilter.value)
  }
  
  if (difficultyFilter.value) {
    filtered = filtered.filter(q => q.difficulty === difficultyFilter.value)
  }
  
  return filtered
})

const isQuestionSelected = (questionId: string) => {
  return props.selectedQuestions.includes(questionId)
}

const toggleQuestionSelection = (questionId: string) => {
  const newSelection = [...props.selectedQuestions]
  const index = newSelection.indexOf(questionId)
  
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(questionId)
  }
  
  emit('update:selectedQuestions', newSelection)
}

const handleSearchChange = (query: string) => {
  searchQuery.value = query
  emit('search-change', query)
}

const loadQuestionsData = async () => {
  try {
    await loadQuestions('/questions')
  } catch (error) {
    console.error('Sorular yüklenirken hata oluştu:', error)
  }
}

// Load questions on mount
loadQuestionsData()
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

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.question-card {
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

.question-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.question-text {
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.4;
}

.question-options {
  font-size: 14px;
  color: #666;
}

.option {
  margin-bottom: 4px;
}

.more-options {
  font-style: italic;
  color: #999;
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
  .questions-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
