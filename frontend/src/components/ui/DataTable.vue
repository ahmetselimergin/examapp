<template>
  <div class="modern-data-table">
    <!-- Header and Controls removed -->

    <!-- Table Container -->
    <div class="table-wrapper">
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th v-if="selectable" class="select-column">
                <div class="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    :checked="allSelected" 
                    @change="toggleAll"
                    class="table-checkbox"
                  />
                </div>
              </th>
              <th 
                v-for="column in columns" 
                :key="column.key"
                :class="{ sortable: column.sortable, filterable: column.filterable !== false }"
                :data-column-key="column.key"
                class="table-header-cell"
              >
                <div class="header-content">
                  <div class="header-actions">
                    
                    <span 
                      v-if="column.filterable !== false" 
                      class="filter-icon material-symbols-outlined" 
                      @click="toggleFilter(column.key)"
                      :class="{ active: activeFilter === column.key }"
                    >
                    filter_alt
                    </span>
                    <span v-if="column.sortable" class="sort-icon" @click="sort(column.key)">
                      <span v-if="sortBy === column.key" class="active-sort">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                      <span v-else class="inactive-sort">↕</span>
                    </span>
                  </div>
                  
                  <span class="header-text">{{ column.label }}</span>
                </div>
                
                <!-- Filter Dropdown -->
                <div 
                  v-if="activeFilter === column.key" 
                  class="filter-dropdown"
                  :style="getFilterDropdownStyle(column.key)"
                  @click.stop
                >
                  <div class="filter-content">
                    <div class="filter-input-wrapper">
                      <span class="material-symbols-outlined">search</span>
                      <input 
                        v-model="filterValue" 
                        type="text" 
                        placeholder="Value"
                        class="filter-input"
                        @input="applyFilter"
                      />
                    </div>
                    <div class="filter-conditions">
                      <div 
                        v-for="condition in filterConditions" 
                        :key="condition.value"
                        class="filter-condition"
                        :class="{ active: selectedCondition === condition.value }"
                        @click="selectCondition(condition.value)"
                      >
                        {{ condition.label }}
                        <span v-if="selectedCondition === condition.value" class="checkmark">✓</span>
                      </div>
                    </div>
                    <div class="filter-actions">
                      <button class="reset-btn" @click="resetFilter">
                        <span class="material-symbols-outlined">refresh</span>
                        Reset
                      </button>
                      <button class="close-btn" @click="activeFilter = null">
                        <span class="material-symbols-outlined">close</span>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </th>
              <th v-if="actions" class="actions-column"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="getItemId(item)" class="table-row" @dblclick="$emit('row-double-click', item)">
              <td v-if="selectable" class="select-column">
                <div class="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    :checked="isItemSelected(getItemId(item))"
                    @change="toggleItem(getItemId(item))"
                    class="table-checkbox"
                  />
                </div>
              </td>
              <td v-for="column in columns" :key="column.key" class="table-cell">
                <slot 
                  :name="`cell-${column.key}`" 
                  :item="item" 
                  :value="getNestedValue(item, column.key)"
                  :index="index"
                >
                  <span class="cell-content">{{ getNestedValue(item, column.key) }}</span>
                </slot>
              </td>
              <td v-if="actions" class="actions-column">
                <div class="actions-menu">
                  <button 
                    class="actions-trigger"
                    :data-actions-index="index"
                    @click="toggleActionsMenu(index)"
                    :class="{ active: activeActionsMenu === index }"
                  >
                    ⋮
                  </button>
                  
                  <!-- Actions Popup Menu -->
                  <div 
                    v-if="activeActionsMenu === index" 
                    class="actions-popup"
                    :style="getActionsPopupStyle(index)"
                    @click.stop
                  >
                    <div class="action-buttons">
                      <slot name="actions" :item="item" :index="index" :closeMenu="() => closeActionsMenu()" />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination removed -->

    <!-- Empty State -->
    <div v-if="filteredData.length === 0" class="empty-state">
      <slot name="empty">
        <Empty 
          :icon="emptyIcon"
          :title="emptyTitle"
          :description="emptyDescription"
          :action-text="emptyActionText"
          :action-variant="emptyActionVariant"
          :show-action="!!emptyActionText"
          @action="$emit('empty-action')"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useTable } from '../../composables/useTable'
import type { DataTableColumn } from '../../types'
import Empty from './Empty.vue'

interface Props {
  data: any[]
  columns: DataTableColumn[]
  title?: string
  selectable?: boolean
  actions?: boolean
  showFilters?: boolean
  searchPlaceholder?: string
  pagination?: boolean
  pageSize?: number
  filters?: boolean
  showExport?: boolean
  showAdd?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionText?: string
  emptyActionVariant?: 'primary' | 'secondary' | 'danger' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  actions: false,
  showFilters: true,
  searchPlaceholder: 'Search...',
  pagination: true,
  pageSize: 10,
  filters: false,
  showExport: false,
  showAdd: false,
  emptyIcon: 'inbox',
  emptyTitle: 'Veri bulunamadı',
  emptyDescription: 'Burada gösterilecek veri bulunmuyor.',
  emptyActionText: '',
  emptyActionVariant: 'primary'
})

const emit = defineEmits<{
  'selection-change': [selectedItems: string[]]
  'page-change': [page: number]
  'size-change': [size: number]
  'export': []
  'add': []
  'row-double-click': [item: any]
  'empty-action': []
}>()

// Pagination removed

const {
  selectedItems,
  sortBy,
  sortOrder,
  filteredData,
  allSelected,
  toggleAll,
  toggleItem,
  isItemSelected,
  sort,
  setFilter,
  clearFilters,
  updateData
} = useTable(props.columns, props.data)

// Watch for data changes and update the table
watch(() => props.data, (newData) => {
  updateData(newData)
}, { immediate: true, deep: true })

const paginatedData = computed(() => {
  return filteredData.value
})

const getItemId = (item: any) => item._id || item.id

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || ''
}

// Methods

// Watch for selection changes
watch(selectedItems, (newSelection) => {
  emit('selection-change', newSelection)
}, { deep: true })

// Page size watch removed

// Filter functionality
const activeFilter = ref<string | null>(null)
const filterValue = ref('')
const selectedCondition = ref('contains')
const columnFilters = ref<Record<string, { value: string, condition: string }>>({})

// Actions menu functionality
const activeActionsMenu = ref<number | null>(null)

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.filter-dropdown') && !target.closest('.filter-icon')) {
    activeFilter.value = null
  }
  if (!target.closest('.actions-popup') && !target.closest('.actions-trigger')) {
    activeActionsMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const filterConditions = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' }
]

const toggleFilter = (columnKey: string) => {
  if (activeFilter.value === columnKey) {
    // Don't close the dropdown, just keep it open
    return
  } else {
    activeFilter.value = columnKey
    filterValue.value = columnFilters.value[columnKey]?.value || ''
    selectedCondition.value = columnFilters.value[columnKey]?.condition || 'contains'
    
    // Update position after DOM update
    nextTick(() => {
      // Force re-render to update position
      const dropdown = document.querySelector('.filter-dropdown') as HTMLElement
      if (dropdown) {
        dropdown.style.display = 'none'
        dropdown.offsetHeight // Trigger reflow
        dropdown.style.display = 'block'
      }
    })
  }
}

const selectCondition = (condition: string) => {
  selectedCondition.value = condition
  // Don't close the dropdown, just update the condition
  // applyFilter() will be called when user types in the input
}

const applyFilter = () => {
  if (!activeFilter.value) return
  
  columnFilters.value[activeFilter.value] = {
    value: filterValue.value,
    condition: selectedCondition.value
  }
  
  // Apply the filter to the table data
  const filterKey = activeFilter.value
  const filterValueToApply = filterValue.value
  const condition = selectedCondition.value
  
  if (filterValueToApply) {
    setFilter(filterKey, filterValueToApply, 'text', condition)
  } else {
    clearFilters()
  }
}

const resetFilter = () => {
  if (!activeFilter.value) return
  
  delete columnFilters.value[activeFilter.value]
  filterValue.value = ''
  selectedCondition.value = 'contains'
  
  // Reset the filter in the table data
  clearFilters()
}

// Get filter dropdown position
const getFilterDropdownStyle = (columnKey: string) => {
  if (!activeFilter.value || activeFilter.value !== columnKey) return {}
  
  // Find the column header element
  const headerElement = document.querySelector(`[data-column-key="${columnKey}"]`)
  if (!headerElement) return {}
  
  const rect = headerElement.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  
  return {
    top: `${rect.bottom + scrollTop + 4}px`,
    left: `${rect.left + scrollLeft}px`,
    width: `${rect.width}px`
  }
}

// Actions menu functions
const toggleActionsMenu = (index: number) => {
  if (activeActionsMenu.value === index) {
    activeActionsMenu.value = null
  } else {
    activeActionsMenu.value = index
  }
}

const closeActionsMenu = () => {
  activeActionsMenu.value = null
}

const getActionsPopupStyle = (index: number) => {
  if (activeActionsMenu.value !== index) return {}
  
  // Find the actions trigger element
  const triggerElement = document.querySelector(`[data-actions-index="${index}"]`)
  if (!triggerElement) return {}
  
  const rect = triggerElement.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  
  return {
    top: `${rect.bottom + scrollTop + 4}px`,
    left: `${rect.left + scrollLeft - 100}px`, // Offset to align with trigger
    minWidth: '120px'
  }
}
</script>

<style scoped lang="scss">
.modern-data-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

// Header Section
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  border-bottom: 1px solid #f1f3f4;
  background: #fafbfc;
}

.header-left {
  .table-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    line-height: 1.2;
  }
  
  .table-stats {
    .stats-text {
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

// Controls Section
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #f1f3f4;
}

.controls-left {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.search-container {
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    .search-icon {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 20px;
      z-index: 1;
    }
    
    .search-input {
      padding: 12px 16px 12px 44px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px;
      width: 300px;
      background: #f9fafb;
      transition: all 0.2s ease;
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        background: white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      &::placeholder {
        color: #9ca3af;
      }
    }
  }
}

.controls-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rows-per-page {
  .rows-select {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
}

// Table Wrapper
.table-wrapper {
  background: white;
}

.table-container {
  overflow-x: auto;
  max-height: 600px;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.table-header-cell {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  padding: 16px 20px;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid #e5e7eb;
  
  &.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: #f1f5f9;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  
  .header-text {
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
    letter-spacing: 0.05em;
    color: #42474f;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .sort-icon {
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: #f1f5f9;
    }
    
    .active-sort {
      color: #3b82f6;
      font-weight: 600;
    }
    
    .inactive-sort {
      color: #9ca3af;
      opacity: 0.6;
    }
  }
  
  .filter-icon {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    font-size: 16px;
    color: #9ca3af;
    
    &:hover {
      background: #f1f5f9;
      color: #6b7280;
    }
    
    &.active {
      color: #3b82f6;
      background: #eff6ff;
    }
  }
}

.table-row {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.table-cell {
  padding: 16px 20px;
  color: #374151;
  font-size: 14px;
  vertical-align: middle;
  
  .cell-content {
    display: block;
    line-height: 1.5;
  }
}

.select-column {
  width: 60px;
  text-align: center;
  
  .checkbox-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .table-checkbox {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 2px solid #d1d5db;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:checked {
      background: #3b82f6;
      border-color: #3b82f6;
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.actions-column {
  width: 60px;
  text-align: center;
  
  .actions-menu {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .actions-dots {
    font-size: 18px;
    color: #9ca3af;
    font-weight: bold;
  }
  
  .actions-trigger {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    font-size: 18px;
    color: #9ca3af;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    position: relative;
    
    &:hover {
      background: #f3f4f6;
      color: #6b7280;
      transform: scale(1.05);
    }
    
    &.active {
      background: #3b82f6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transform: scale(1.1);
      
      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #3b82f6;
        border-radius: 10px;
        opacity: 0.3;
        animation: pulse 1.5s infinite;
      }
    }
  }
  
  .actions-popup {
    position: fixed !important;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1);
    z-index: 99999 !important;
    padding: 8px 0;
    min-width: 140px;
    animation: slideIn 0.2s ease-out;
    transform-origin: top;
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      button, a {
        padding: 8px 12px;
        text-align: left;
        border: none;
        background: none;
        cursor: pointer;
        color: #374151;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 6px;
        margin: 0 2px;
        
        .material-symbols-outlined {
          font-size: 16px;
          transition: transform 0.2s ease;
        }
        
        &:hover {
          background: #f8fafc;
          color: #1f2937;
          transform: translateX(4px);
          
          .material-symbols-outlined {
            transform: scale(1.1);
          }
        }
        
        &:active {
          transform: translateX(2px) scale(0.98);
        }
        
        &.danger {
          color: #374151;
          
          &:hover {
            background: #f8fafc;
            color: #1f2937;
            transform: translateX(4px);
          }
        }
      }
    }
  }
}

// Pagination Section
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: #fafbfc;
  border-top: 1px solid #f1f3f4;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-numbers {
  display: flex;
  gap: 4px;
  margin: 0 8px;
}

.page-number {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
  
  &.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }
}

.go-to-page {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  
  .page-input {
    width: 60px;
    padding: 6px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    text-align: center;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
}

// Filter Dropdown
.filter-dropdown {
  position: fixed !important;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 99999 !important;
  margin-top: 4px;
  min-width: 250px;
  max-width: 300px;
}

.filter-content {
  padding: 16px;
}

.filter-input-wrapper {
  position: relative;
  margin-bottom: 12px;
  
  .material-symbols-outlined {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 16px;
  }
  
  .filter-input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    background: #f9fafb;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &::placeholder {
      color: #9ca3af;
    }
  }
}

.filter-conditions {
  margin-bottom: 12px;
}

.filter-condition {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #374151;
  
  &:hover {
    background: #f1f5f9;
  }
  
  &.active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 500;
  }
  
  .checkmark {
    color: #3b82f6;
    font-weight: 600;
  }
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  
  .reset-btn, .close-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .material-symbols-outlined {
      font-size: 16px;
    }
  }
  
  .reset-btn {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #6b7280;
    
    &:hover {
      background: #e5e7eb;
      color: #374151;
    }
  }
  
  .close-btn {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    
    &:hover {
      background: #fecaca;
      color: #b91c1c;
    }
  }
}

// Table header cell with filter support
.table-header-cell {
  position: relative;
  
  &.filterable {
    .header-content {
      cursor: pointer;
    }
  }
}

// Empty State
.empty-state {
  padding: 20px;
  background: white;
}

// Responsive Design
@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-start;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .controls-left {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container .search-input-wrapper .search-input {
    width: 100%;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .table-header,
  .table-controls,
  .pagination-section {
    padding: 16px 20px;
  }
  
  .table-cell,
  .table-header-cell {
    padding: 12px 16px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
}

// Animations
@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
