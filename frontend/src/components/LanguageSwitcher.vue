<template>
  <div class="language-switcher">
    <Button 
      @click="changeLanguage('tr')" 
      :styleType="currentLocale === 'tr' ? 'primary' : 'secondary'"
      :text="t('common.tr')"
    />
    <Button 
      @click="changeLanguage('en')" 
      :styleType="currentLocale === 'en' ? 'primary' : 'secondary'"
      :text="t('common.en')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import Button from './ui/Button.vue';

type Locale = 'tr' | 'en';

const { locale, t } = useI18n();

const currentLocale = computed(() => locale.value)

const changeLanguage = (lang: Locale) => {
  locale.value = lang;
  localStorage.setItem('language', lang);
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 8px;
}

button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}
</style> 