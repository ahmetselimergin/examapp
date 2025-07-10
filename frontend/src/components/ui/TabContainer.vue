<template>
  <div class="tab-container">
    <div class="tab-headers">
      <button v-for="(tab, idx) in tabs" :key="tab.name" :class="['tab-btn', { active: idx === activeIndex }]"
        @click="activeIndex = idx">
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content">
      <slot :active="activeIndex" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'

const props = defineProps<{
  tabs: { name: string; label: string }[]
}>()

const activeIndex = ref(0)
</script>

<style scoped lang="scss">
.tab-headers {
  display: flex;
  background: #ebebeb;
  margin-bottom: 1em;
  padding: 0.5em;
  border-radius: 0.5em;
  justify-content: space-between;
  width: -webkit-fill-available;
  margin: auto;

  .tab-btn {
    background: none;
    border: none;
    padding: 1em 2em;
    width: -webkit-fill-available;
    font-weight: 600;
    cursor: pointer;
    color: #888;
    transition: color 0.2s, border 0.2s;

    &.active {
      color: #333;
      background: #fff;
      border-radius: 0.5em;
    }
  }
}

.tab-content {
  padding: 1em 0;
}
</style>