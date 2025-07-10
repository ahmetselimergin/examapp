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
  gap: .25em;
 
}
.ui-select-label {
  display: block;
  font-weight: 500;
  color: $darkgrey;
          font-size: 14px;
}
.ui-select {
  width: 100%;
  padding: 1em 2.5em 1em 1em;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #fff;
  transition: border 0.2s;
  &.small {
    padding: 0.5em;
    font-size: 0.75em;
  }
  &.medium {
    padding: 0.7em;
    font-size: .875em;
  }  
  &.large {
    padding: 1em;
    font-size: 1em;
  }
  

  &:focus {
    border-color: $primary;
    outline: none;
  }
}
</style>
