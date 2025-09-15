<template>
  <div class="filter-bar">
    <div class="search-section">
      <Input 
        v-model="searchQuery" 
        :placeholder="searchPlaceholder"
        size="medium"
        icon="search"
      />
    </div>
    
    <div class="filters-section">
      <slot name="filters" :filters="filters" :setFilter="setFilter" />
    </div>
    
    <div class="actions-section">
      <Button 
        v-if="showClearButton"
        @click="clearAllFilters"
        styleType="lightgrey"
        size="small"
        :text="'Temizle'"
      />
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Input from './Input.vue'
import Button from './Button.vue'

interface Filter {
  key: string
  value: any
  type: 'text' | 'select' | 'date'
}

interface Props {
  searchPlaceholder?: string
  showClearButton?: boolean
  initialFilters?: Filter[]
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Ara...',
  showClearButton: true,
  initialFilters: () => []
})

const emit = defineEmits<{
  'search-change': [query: string]
  'filter-change': [filters: Filter[]]
  'clear-filters': []
}>()

const searchQuery = ref('')
const filters = ref<Filter[]>([...props.initialFilters])

const setFilter = (key: string, value: any, type: 'text' | 'select' | 'date' = 'text') => {
  const existingFilter = filters.value.find(f => f.key === key)
  if (existingFilter) {
    existingFilter.value = value
  } else {
    filters.value.push({ key, value, type })
  }
  emit('filter-change', filters.value)
}

const clearAllFilters = () => {
  searchQuery.value = ''
  filters.value = []
  emit('clear-filters')
  emit('search-change', '')
  emit('filter-change', [])
}

watch(searchQuery, (newQuery) => {
  emit('search-change', newQuery)
})

watch(filters, (newFilters) => {
  emit('filter-change', newFilters)
}, { deep: true })
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e3e7ef;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 200px;
}

.filters-section {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.actions-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    min-width: auto;
  }
  
  .filters-section {
    justify-content: stretch;
  }
  
  .actions-section {
    justify-content: center;
  }
}
</style>
