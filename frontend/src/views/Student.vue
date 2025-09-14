<template>
  <div>
    <h1>Öğrenci Listesi</h1>
    <div class="search-filter-row">
      <Input v-model="search" label="" placeholder="Ara... (isim/email)" size="medium" />
    </div>
    <table class="modern-table">
      <thead>
        <tr>
          <th><input type="checkbox" @change="toggleAll" :checked="allSelected" /></th>
          <th>Ad</th>
          <th>Email</th>
          <th>Eğitmen(ler)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in filteredStudents" :key="student._id">
          <td>
            <input type="checkbox" :value="student._id" v-model="selectedStudents" />
          </td>
          <td>{{ student.name }}</td>
          <td>{{ student.email }}</td>
          <td>
            <span v-if="studentTeachers[student._id] && studentTeachers[student._id].length">
              {{ studentTeachers[student._id].map((t: any) => t.name).join(', ') }}
            </span>
            <span v-else>-</span>
          </td>
          <td>
            <Button styleType="danger" size="small" @click="deleteStudent(student._id)">Sil</Button>
          </td>
        </tr>
      </tbody>
    </table>
    <Button v-if="selectedStudents.length" styleType="primary" class="assign-btn" @click="showAssignModal = true">Eğitmene Ata</Button>

    <!-- Eğitmene atama modalı -->
    <Modal v-model="showAssignModal" title="Eğitmen Seç" :showCloseButton="true">
      <template #default>
        <div class="teacher-selection">
          <p class="modal-description">Seçilen öğrencileri aşağıdaki eğitmenlere atayabilirsiniz:</p>
          <div class="teacher-list">
            <div 
              v-for="teacher in teachers" 
              :key="teacher._id"
              :class="['teacher-item', { 'selected': selectedTeacherIds.includes(teacher._id) }]"
              @click="toggleTeacherSelection(teacher._id)"
            >
              <input 
                type="checkbox" 
                :checked="selectedTeacherIds.includes(teacher._id)"
                @change="toggleTeacherSelection(teacher._id)"
              />
              <span class="teacher-name">{{ teacher.name }} ({{ teacher.email }})</span>
            </div>
          </div>
        </div>
        <div v-if="teachers.length === 0" class="no-teacher-msg">Sistemde eğitmen bulunamadı.</div>
      </template>
      <template #footer>
        <Button styleType="primary" :disabled="!selectedTeacherIds.length" @click="assignStudentsToTeachers">Ata</Button>
        <Button styleType="danger" @click="showAssignModal = false">İptal</Button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import Input from '../components/ui/Input.vue';
import Select from '../components/ui/Select.vue';
import Button from '../components/ui/Button.vue';
import Modal from '../components/ui/Modal.vue';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const students = ref<any[]>([]);
const teachers = ref<any[]>([]);
const studentTeachers = ref<{[key: string]: any[]}>({});
const selectedStudents = ref<string[]>([]);
const selectedTeacherIds = ref<string[]>([]);
const showAssignModal = ref(false);
const search = ref('');

const loadStudents = async () => {
  try {
    const response = await api.get('/auth/admin/users');
    students.value = response.data.filter((user: any) => user.role === 'student');
    console.log('Öğrenciler yüklendi:', students.value);
  } catch (error) {
    console.error('Öğrenci yükleme hatası:', error);
  }
};

const loadTeachers = async () => {
  try {
    const response = await api.get('/teachers');
    if (Array.isArray(response.data) && response.data.length > 0) {
      teachers.value = response.data;
    } else {
      const fallback = await api.get('/auth/admin/users');
      teachers.value = fallback.data.filter((u: any) => u.role === 'teacher');
    }
  } catch (e) {
    const fallback = await api.get('/auth/admin/users');
    teachers.value = fallback.data.filter((u: any) => u.role === 'teacher');
  }
};

const deleteStudent = async (id: string) => {
  if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
    await api.delete(`/auth/admin/users/${id}`);
    await loadStudents();
  }
};

const filteredStudents = computed(() => {
  let filtered = students.value;
  if (search.value) {
    const s = search.value.toLowerCase();
    filtered = filtered.filter((stu: any) =>
      stu.name.toLowerCase().includes(s) || stu.email.toLowerCase().includes(s)
    );
  }
  return filtered;
});

const allSelected = computed(() => selectedStudents.value.length === filteredStudents.value.length && filteredStudents.value.length > 0);

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    selectedStudents.value = filteredStudents.value.map((s: any) => s._id);
  } else {
    selectedStudents.value = [];
  }
}

function toggleTeacherSelection(teacherId: string) {
  const index = selectedTeacherIds.value.indexOf(teacherId);
  if (index > -1) {
    selectedTeacherIds.value.splice(index, 1);
  } else {
    selectedTeacherIds.value.push(teacherId);
  }
}

async function assignStudentsToTeachers() {
  if (!selectedTeacherIds.value.length || !selectedStudents.value.length) return;
  
  try {
    // Her öğrenci için seçilen tüm öğretmenlere atama yap
    const assignments = [];
    for (const studentId of selectedStudents.value) {
      for (const teacherId of selectedTeacherIds.value) {
        assignments.push(
          api.post(`/teachers/${teacherId}/students`, { studentId })
        );
      }
    }
    
    await Promise.all(assignments);
    
    showAssignModal.value = false;
    selectedStudents.value = [];
    selectedTeacherIds.value = [];
    await loadStudents();
    alert('Öğrenciler eğitmenlere atandı!');
  } catch (error: any) {
    alert(error.response?.data?.message || 'Atama işlemi başarısız oldu!');
  }
}

onMounted(async () => {
  await loadStudents();
  await loadTeachers();
});
</script>

<style scoped>
.search-filter-row {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
  align-items: flex-end;
}
.assign-btn {
  margin-top: 1em;
}
.no-teacher-msg {
  color: #e74c3c;
  margin-top: 1em;
  font-size: 1em;
}
.modal-description {
  margin-bottom: 1em;
  color: #666;
}
.teacher-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e3e7ef;
  border-radius: 8px;
  padding: 0.5em;
}
.teacher-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.teacher-item:hover {
  background-color: #f0f4fa;
}
.teacher-item.selected {
  background-color: #e3f2fd;
}
.teacher-name {
  flex: 1;
}
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.modern-table th, .modern-table td {
  padding: 14px 16px;
  text-align: left;
}
.modern-table th {
  background: #f7f8fa;
  font-weight: 700;
  color: #1976d2;
  border-bottom: 2px solid #e3e7ef;
}
.modern-table tr {
  transition: background 0.2s;
}
.modern-table tbody tr:hover {
  background: #f0f4fa;
}
.modern-table td {
  border-bottom: 1px solid #e3e7ef;
  font-size: 1em;
}
.modern-table tr:last-child td {
  border-bottom: none;
}
.modern-table th:first-child, .modern-table td:first-child {
  border-top-left-radius: 12px;
}
.modern-table th:last-child, .modern-table td:last-child {
  border-top-right-radius: 12px;
}
</style>