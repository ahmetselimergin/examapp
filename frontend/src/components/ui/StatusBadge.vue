<template>
  <span :class="['status-badge', statusClass]">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  status: string
  type?: 'exam' | 'user' | 'question' | 'custom'
  customLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'custom'
})

const { t } = useI18n()

const statusMap = {
  exam: {
    upcoming: { labelKey: 'exam.upcoming', class: 'upcoming' },
    active: { labelKey: 'exam.active', class: 'active' },
    completed: { labelKey: 'exam.completed', class: 'completed' }
  },
  user: {
    active: { labelKey: 'user.active', class: 'active' },
    inactive: { labelKey: 'user.inactive', class: 'inactive' },
    pending: { labelKey: 'user.pending', class: 'pending' }
  },
  question: {
    // Difficulty levels
    easy: { labelKey: 'questionBank.easy', class: 'easy' },
    medium: { labelKey: 'questionBank.medium', class: 'medium' },
    hard: { labelKey: 'questionBank.hard', class: 'hard' },
    // Question types
    single_choice: { labelKey: 'questionBank.singleChoice', class: 'single-choice' },
    multiple_select: { labelKey: 'questionBank.multipleSelect', class: 'multiple-select' },
    true_false: { labelKey: 'questionBank.trueFalse', class: 'true-false' },
    open_ended: { labelKey: 'questionBank.openEnded', class: 'open-ended' }
  },
  custom: {}
}

const label = computed(() => {
  if (props.customLabel) return props.customLabel
  
  const typeMap = statusMap[props.type] as Record<string, { labelKey: string; class: string }>
  const statusConfig = typeMap[props.status]
  return statusConfig ? t(statusConfig.labelKey) : props.status
})

const statusClass = computed(() => {
  if (props.customLabel) return 'custom'
  
  const typeMap = statusMap[props.type] as Record<string, { labelKey: string; class: string }>
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

// Question types
.single-choice {
  background: #e0e7ff;
  color: #5b21b6;
}

.multiple-select {
  background: #dbeafe;
  color: #1e40af;
}

.true-false {
  background: #dcfce7;
  color: #16a34a;
}

.open-ended {
  background: #fed7aa;
  color: #ea580c;
}

// Default
.default, .custom {
  background: #e3f2fd;
  color: #1976d2;
}
</style>
