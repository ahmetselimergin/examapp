<template>
  <div class="ui-select-wrapper">
    <label v-if="label" class="ui-select-label">{{ label }}</label>
    <select
      class="ui-select"
      :class="size"
      v-bind="$attrs"
      :placeholder="placeholder"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <template v-if="options && options.length">
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </template>
      <slot v-else />
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  options?: { value: string | number, label: string }[]
}>()
defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
@import "../../assets/styles/_framework.scss";

.ui-select-wrapper {
  width: 100%;
  margin-bottom: 1em;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: .5em;
}

.ui-select-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;
}

.ui-select {
  width: 100%;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  
  &.small {
    padding: 8px 35px 8px 12px;
    font-size: 13px;
    height: 32px;
  }
  
  &.medium {
    padding: 10px 40px 10px 12px;
    font-size: 14px;
    height: 40px;
  }
  
  &.large {
    padding: 12px 45px 12px 16px;
    font-size: 16px;
    height: 48px;
  }

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }

  &::placeholder {
    color: var(--text-tertiary);
  }

  option {
    background: var(--bg-primary);
    color: var(--text-primary);
    padding: 8px 12px;
  }
}

/* Dark mode specific styles */
[data-theme="dark"] .ui-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
}
</style>
