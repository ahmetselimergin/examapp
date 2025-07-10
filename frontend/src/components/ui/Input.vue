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
          color: $darkgrey;
     }
}

.ui-input {
     transition: border 0.2s;
     width: 100%;
     border: 1px solid #ddd;
     border-radius: 5px;
     background: #fff;
     transition: border 0.2s;
     padding: 0.5em;
     font-size: 0.8em;
     font-family: inherit;

     &:focus {
          border-color: $primary;
          outline: none;
     }

     &.large {
          width: 100%;
          padding: 1em .75em;
          border: 3px solid #d7d7d7;
          border-radius: 8px;
          font-size: 1em;
          background: #fff;
     }

     &.small {
          width: 100%;
          padding: 0.5em .75em;
          border: 1px solid #d7d7d7;
          border-radius: 5px;
          font-size: 0.75em;
          background: #fff;
     }

     &.medium {
          width: 100%;
          padding: 0.7em .75em;
          border: 1px solid #d7d7d7;
          border-radius: 5px;
          font-size: .875em;
          background: #fff;
     }
}

.ui-textarea {
     resize: vertical;
     min-height: 100px;
     font-family: inherit;
}
</style>
