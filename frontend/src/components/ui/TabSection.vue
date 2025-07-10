<template>
     <div v-if="active">
       <slot />
     </div>
   </template>
   
   <script setup lang="ts">
   defineProps<{
     active: boolean
   }>()
   </script>