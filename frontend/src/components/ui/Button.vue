<template>
     <button :class="['ui-btn', styleType, { rounded: rounded }, size]" :type="nativeType">
        <span v-if="icon" class="material-symbols-outlined">{{ icon }}</span>
        <span v-if="text">{{ text }}</span>
       <slot />
     </button>
   </template>
   
   <script setup lang="ts">
   defineProps<{
     rounded?: boolean
     styleType?: 'primary' | 'secondary' | 'white' | 'darkgrey' | 'lightgrey' | 'danger'
     nativeType?: 'button' | 'submit' | 'reset'
     size?: 'small' | 'medium' | 'large'|'icon'
     icon?: string
     text?: string
   }>()
   </script>
   
   <style scoped lang="scss">
     @import "../../assets/styles/_framework.scss";
  .ui-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    border: 1px solid transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    .material-symbols-outlined{
         font-size: 14px !important;
    }
     &.rounded {
          border-radius: 100px;
     }
     &.primary {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
       &:hover { 
         background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
       }
     }
     &.danger {
       background: $red;
       color: $white;
       &:hover { background: $red; }
     }
     &.secondary {
       background: $secondary;
       color: $darkgrey;
       &:hover { background: $secondary; }
     }
     
     &.white {
       background: $white;
       color: $darkgrey;
       &:hover { background: $white; }
     }
     
     &.darkgrey {
       background: $darkgrey;
       color: $white;
       &:hover { background: $darkgrey; }
     }
     &.lightgrey {
          background: $lightgrey;
          color: $darkgrey;
          &:hover { background: $lightgrey; }
     }
     &.small {
          padding: 0.5em 1em;
          font-size: 12px;
          .material-symbols-outlined{
               font-size: 16px !important;
          }
     }
     &.medium {
          padding: 0.75em 1.5em;
          font-size: 14px;
          .material-symbols-outlined{
               font-size: 18px !important;
          }
     }  
     &.large {
          padding: 1em 2em;
          font-size: 16px;
          .material-symbols-outlined{
               font-size: 20px !important;
          }
     }
     &.icon {
          padding: 0.5em;
          font-size: 11px;
          .material-symbols-outlined{
               font-size: 11px !important;
          }
     }

   }
   </style>