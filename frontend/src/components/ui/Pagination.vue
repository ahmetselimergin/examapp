<template>
  <div class="pagination">
    <button 
      class="pagination-btn" 
      :disabled="currentPage === 1"
      @click="$emit('update:modelValue', currentPage - 1)"
    >
      <span class="material-symbols-outlined">
        keyboard_backspace
      </span>
    </button>

    <div class="pagination-numbers">
      <button 
        v-for="page in displayedPages" 
        :key="page"
        :class="['page-number', { active: page === currentPage }]"
        @click="$emit('update:modelValue', page)"
      >
        {{ page }}
      </button>
    </div>

    <button 
      class="pagination-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('update:modelValue', currentPage + 1)"
    >
      <span class="material-symbols-outlined">
            arrow_right_alt
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: number;
  totalItems: number;
  perPage: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  totalItems: 0,
  perPage: 10
});

defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

const currentPage = computed(() => props.modelValue);
const totalPages = computed(() => Math.ceil(props.totalItems / props.perPage));

const displayedPages = computed(() => {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
</script>

<style scoped lang="scss">
     @import "../../assets/styles/_framework.scss";
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.page-number.active {
  background: $dark-blue;
  border-color: $dark-blue;
  color: #fff;
}

.icon {
  font-size: 18px;
  line-height: 1;
}
</style> 