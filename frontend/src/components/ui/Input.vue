<template>
<div class="input-group">
     <label class="input-label">{{ label }}</label>
     <input 
          v-if="type !== 'textarea'" 
          :class="['ui-input', size]" 
          :type="type"
          :value="modelValue" 
          :placeholder="placeholder" 
          @input="$emit('update:modelValue', $event.target.value)" 
          v-bind="$attrs" 
     />
     <textarea 
          v-else
          :class="['ui-input', 'ui-textarea', size]" 
          :value="modelValue" 
          :placeholder="placeholder" 
          @input="$emit('update:modelValue', $event.target.value)" 
          v-bind="$attrs"
          rows="4"
     ></textarea>
</div>
</template>

<script lang="ts" setup>
defineProps<{
     modelValue?: string | number
     size?: 'small' | 'medium' | 'large'
     placeholder?: string
     label?: string
     type?: string
}>()
</script>

<style lang="scss" scoped>
@import "../../assets/styles/_framework.scss";

.input-group {
     width: 100%;
     display: flex;
     gap: .25em;
     margin-bottom: 1em;
     position: relative;
     flex-direction: column;
     gap: 0.25em;

     .input-label {
          font-size: .875em;
          font-weight: 500;
          color: var(--text-primary);
     }
}

.ui-input {
     transition: border 0.2s, background-color 0.2s, color 0.2s;
     width: 100%;
     height: 40px;
     border: 1px solid var(--border-secondary);
     border-radius: 6px;
     background: var(--bg-primary);
     color: var(--text-primary);
     padding: 0 10px;
     font-size: 14px;
     font-family: inherit;

     &:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
     }
     
     &::placeholder {
          color: var(--text-tertiary);
     }

     &.large {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1px solid var(--border-secondary);
          border-radius: 8px;
          font-size: 16px;
          background: var(--bg-primary);
          color: var(--text-primary);
          
          &:focus {
               border-color: #667eea;
               box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
     }

     &.small {
          width: 100%;
          height: 32px;
          padding: 0 8px;
          border: 1px solid var(--border-secondary);
          border-radius: 4px;
          font-size: 13px;
          background: var(--bg-primary);
          color: var(--text-primary);
          
          &:focus {
               border-color: #667eea;
               box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
     }

     &.medium {
          width: 100%;
          height: 40px;
          padding: 0 10px;
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          font-size: 14px;
          background: var(--bg-primary);
          color: var(--text-primary);
          
          &:focus {
               border-color: #667eea;
               box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
     }
}

.ui-textarea {
     resize: vertical;
     min-height: 80px;
     height: auto !important;
     padding: 10px !important;
     font-family: inherit;
}
</style>
