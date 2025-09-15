<template>
  <DataTable
    :data="students"
    :columns="columns"
    :selectable="true"
    :actions="true"
    @selection-change="handleSelectionChange"
  >
    <template #cell-name="{ item }">
      {{ item.name }}
    </template>
    
    <template #cell-email="{ item }">
      {{ item.email }}
    </template>
    
    <template #cell-teachers="{ item }">
      <span v-if="studentTeachers[item._id] && studentTeachers[item._id].length">
        {{ studentTeachers[item._id].map((t: any) => t.name).join(', ') }}
      </span>
      <span v-else>-</span>
    </template>
    
    <template #actions="{ item }">
      <Button 
        styleType="danger" 
        size="small" 
        @click="$emit('delete-student', item._id)"
      >
        Sil
      </Button>
    </template>
    
    <template #empty>
      <EmptyState
        icon="person_off"
        title="Öğrenci bulunamadı"
        description="Henüz hiç öğrenci kaydı bulunmamaktadır."
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataTable from '../ui/DataTable.vue'
import Button from '../ui/Button.vue'
import EmptyState from '../ui/EmptyState.vue'

interface Props {
  students: any[]
  studentTeachers: Record<string, any[]>
}

defineProps<Props>()

const emit = defineEmits<{
  'delete-student': [id: string]
  'selection-change': [selectedItems: string[]]
}>()

const columns = [
  { key: 'name', label: 'Ad', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'teachers', label: 'Eğitmen(ler)' }
]

const handleSelectionChange = (selectedItems: string[]) => {
  emit('selection-change', selectedItems)
}
</script>
