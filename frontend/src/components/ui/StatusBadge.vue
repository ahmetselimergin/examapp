<template>
  <span :class="['status-badge', statusClass]">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  type?: 'exam' | 'user' | 'question' | 'custom'
  customLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'custom'
})

const statusMap = {
  exam: {
    upcoming: { label: 'Yakında', class: 'upcoming' },
    active: { label: 'Aktif', class: 'active' },
    completed: { label: 'Tamamlandı', class: 'completed' }
  },
  user: {
    active: { label: 'Aktif', class: 'active' },
    inactive: { label: 'Pasif', class: 'inactive' },
    pending: { label: 'Beklemede', class: 'pending' }
  },
  question: {
    easy: { label: 'Kolay', class: 'easy' },
    medium: { label: 'Orta', class: 'medium' },
    hard: { label: 'Zor', class: 'hard' }
  },
  custom: {}
}

const label = computed(() => {
  if (props.customLabel) return props.customLabel
  
  const typeMap = statusMap[props.type]
  return typeMap[props.status]?.label || props.status
})

const statusClass = computed(() => {
  if (props.customLabel) return 'custom'
  
  const typeMap = statusMap[props.type]
  return typeMap[props.status]?.class || 'default'
})
</script>

<style scoped lang="scss">
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

// Exam statuses
.upcoming {
  background: #fff3e0;
  color: #f57c00;
}

.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.completed {
  background: #f5f5f5;
  color: #666;
}

// User statuses
.inactive {
  background: #ffebee;
  color: #c62828;
}

.pending {
  background: #fff8e1;
  color: #f57c00;
}

// Question difficulties
.easy {
  background: #e8f5e8;
  color: #2e7d32;
}

.medium {
  background: #fff3e0;
  color: #f57c00;
}

.hard {
  background: #ffebee;
  color: #c62828;
}

// Default
.default, .custom {
  background: #e3f2fd;
  color: #1976d2;
}
</style>
