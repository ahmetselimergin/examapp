<template>
  <nav class="breadcrumb" aria-label="breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <template v-if="index === items.length - 1">
          <span class="breadcrumb-current">{{ item.label }}</span>
        </template>
        <template v-else>
          <router-link :to="item.to" class="breadcrumb-link">
            {{ item.label }}
          </router-link>
          <span class="breadcrumb-separator">/</span>
        </template>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<style scoped>
.breadcrumb {
  padding: 0.5rem 0;
}

.breadcrumb-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--text-tertiary);
}
</style>
