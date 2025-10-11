<template>
  <div class="students-container">
    <div class="page-header">
      <div class="header-content">
        <h2>Öğrenci Listesi</h2>
        <p>Öğrencileri yönetin ve düzenleyin</p>
      </div>
      <div class="header-actions">
        <Button 
          type="button" 
          styleType="primary" 
          size="medium" 
          @click="handleAddStudent" 
          icon="add" 
          text="Yeni Öğrenci" 
        />
      </div>
    </div>
    
    <DataTable
      :data="students"
      :columns="[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'teachers', label: 'Instructors' }
      ]"
      title="Students"
      :selectable="true"
      :actions="true"
      :show-export="true"
      @selection-change="handleSelectionChange"
      @export="handleExport"
      @row-double-click="openStudentDetailModal"
    >
      <template #cell-name="{ item }">
        <div class="student-name">
          <div class="name-text">{{ item.name }}</div>
        </div>
      </template>
      
      <template #cell-email="{ item }">
        <div class="student-email">{{ item.email }}</div>
      </template>
      
      <template #cell-teachers="{ item }">
        <div class="teacher-badges">
          <span v-if="studentTeachers[item._id] && studentTeachers[item._id].length" class="teacher-count">
            {{ studentTeachers[item._id].length }} instructor(s)
          </span>
          <span v-else class="no-teacher">No instructor</span>
        </div>
      </template>
      
      <template #actions="{ item, closeMenu }">
        <button @click="editStudent(item); closeMenu()" class="action-btn">
          <span class="material-symbols-outlined">edit</span>
          Edit
        </button>
        <button @click="deleteStudent(item); closeMenu()" class="action-btn">
          <span class="material-symbols-outlined">delete</span>
          Delete
        </button>
      </template>
      
      <template #empty>
        <Empty 
          icon="person_off"
          title="Öğrenci bulunamadı"
          description="Gösterilecek öğrenci bulunmuyor."
          :show-action="false"
        />
      </template>
    </DataTable>
    
    <Button 
      v-if="selectedStudents.length" 
      styleType="primary" 
      class="assign-btn" 
      @click="showAssignModal = true"
    >
      Eğitmene Ata
    </Button>

    <TeacherAssignmentModal
      :isOpen="showAssignModal"
      @update:isOpen="showAssignModal = $event"
      :teachers="teachers"
      :selected-students="selectedStudents"
      :loading="assigning"
      @assign="handleAssignStudents"
    />

    <!-- Student Detail Modal -->
    <Modal 
      :modelValue="showStudentDetailModal" 
      @update:modelValue="handleStudentDetailModalUpdate"
      title="Öğrenci Detayları"
    >
      <div v-if="selectedStudentDetail" class="student-detail-content">
        <div class="student-info">
          <div class="info-section">
            <h3>Kişisel Bilgiler</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Ad Soyad:</label>
                <span>{{ selectedStudentDetail.name }}</span>
              </div>
              <div class="info-item">
                <label>E-posta:</label>
                <span>{{ selectedStudentDetail.email }}</span>
              </div>
              <div class="info-item">
                <label>Rol:</label>
                <span class="role-badge">Öğrenci</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h3>Atanmış Eğitmenler</h3>
            <div v-if="selectedStudentTeachers.length > 0" class="teachers-list">
              <div 
                v-for="teacher in selectedStudentTeachers" 
                :key="teacher._id"
                class="teacher-item"
              >
                <div class="teacher-info">
                  <span class="teacher-name">{{ teacher.name }}</span>
                  <span class="teacher-email">{{ teacher.email }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-teachers">
              <span class="material-symbols-outlined">person_off</span>
              <p>Bu öğrenciye henüz eğitmen atanmamış</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <Button @click="closeStudentDetailModal" variant="secondary">Kapat</Button>
        </div>
      </template>
    </Modal>

    <!-- Create Student Modal -->
    <Modal 
      :modelValue="showCreateStudentModal" 
      @update:modelValue="handleCreateStudentModalUpdate"
      title="Yeni Öğrenci Ekle"
    >
      <div class="create-student-form">
        <div class="form-group">
          <label>Ad Soyad</label>
          <Input v-model="newStudent.name" placeholder="Ad Soyad" />
        </div>
        <div class="form-group">
          <label>E-posta</label>
          <Input v-model="newStudent.email" type="email" placeholder="E-posta" />
        </div>
        <div class="form-group">
          <label>Şifre</label>
          <Input v-model="newStudent.password" type="password" placeholder="Şifre" />
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <Button @click="closeCreateStudentModal" variant="secondary">İptal</Button>
          <Button @click="createStudent" variant="primary">Oluştur</Button>
        </div>
      </template>
    </Modal>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :isOpen="showDeleteModal"
      @update:isOpen="showDeleteModal = $event"
      title="Öğrenciyi Sil"
      :message="`${studentToDelete?.name} adlı öğrenciyi silmek istediğinizden emin misiniz?`"
      :details="`E-posta: ${studentToDelete?.email}`"
      confirmText="Evet, Sil"
      cancelText="İptal"
      confirmStyle="danger"
      iconName="delete_forever"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import DataTable from '../components/ui/DataTable.vue';
import Empty from '../components/ui/Empty.vue';
import TeacherAssignmentModal from '../components/student/TeacherAssignmentModal.vue';
import ConfirmationModal from '../components/ui/ConfirmationModal.vue';
import Modal from '../components/ui/Modal.vue';
import Input from '../components/ui/Input.vue';
import Button from '../components/ui/Button.vue';
import { useToast } from '../composables/useToast';

const { showSuccess, showError, showInfo } = useToast();

// Data refs
const students = ref<any[]>([]);
const teachers = ref<any[]>([]);
const studentTeachers = ref<{[key: string]: any[]}>({});
const showAssignModal = ref(false);
const showCreateStudentModal = ref(false);
const showStudentDetailModal = ref(false);
const showDeleteModal = ref(false);
const studentToDelete = ref<any>(null);
const selectedStudentDetail = ref<any>(null);
const selectedStudentTeachers = ref<any[]>([]);
const deleting = ref(false);
const assigning = ref(false);

// New student form data
const newStudent = ref({
  name: '',
  email: '',
  password: ''
});

// Selected students for assignment
const selectedStudents = ref<string[]>([]);

const loadStudentsData = async () => {
  try {
    console.log('Loading students...');
    const response = await api.get('/auth/admin/users');
    const studentUsers = response.data.filter((user: any) => user.role === 'student');
    students.value = studentUsers;
  } catch (error) {
    console.error('Öğrenci yükleme hatası:', error);
  }
};

const loadTeachersData = async () => {
  try {
    const response = await api.get('/teachers');
    if (!Array.isArray(response.data) || response.data.length === 0) {
      const fallback = await api.get('/auth/admin/users');
      teachers.value = fallback.data.filter((u: any) => u.role === 'teacher');
    } else {
      teachers.value = response.data;
    }
  } catch (e) {
    const fallback = await api.get('/auth/admin/users');
    teachers.value = fallback.data.filter((u: any) => u.role === 'teacher');
  }
};

const loadStudentTeachersData = async () => {
  try {
    // Load teacher assignments for all students
    const promises = students.value.map(async (student) => {
      try {
        const response = await api.get(`/teachers/student/${student._id}/teachers`);
        studentTeachers.value[student._id] = response.data || [];
      } catch (error) {
        console.error(`Error loading teachers for student ${student._id}:`, error);
        studentTeachers.value[student._id] = [];
      }
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error loading student teachers data:', error);
  }
};

const editStudent = (student: any) => {
  // TODO: Implement edit student functionality
  console.log('Edit student:', student);
  showInfo('Öğrenci düzenleme özelliği yakında eklenecek!');
};

const deleteStudent = (student: any) => {
  studentToDelete.value = student;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!studentToDelete.value) return;

  deleting.value = true;
  try {
    await api.delete(`/auth/admin/users/${studentToDelete.value._id}`);
    showSuccess('Öğrenci başarıyla silindi!');
    await loadStudentsData();
    showDeleteModal.value = false;
    studentToDelete.value = null;
  } catch (error) {
    showError('Silme işlemi başarısız oldu!');
  } finally {
    deleting.value = false;
  }
};

const cancelDelete = () => {
  studentToDelete.value = null;
  showDeleteModal.value = false;
};

const handleSelectionChange = (selected: string[]) => {
  selectedStudents.value = selected;
};

const handleAssignStudents = async (studentIds: string[], teacherIds: string[]) => {
  assigning.value = true;
  try {
    const assignments = [];
    for (const studentId of studentIds) {
      for (const teacherId of teacherIds) {
        assignments.push(
          api.post(`/teachers/${teacherId}/students`, { studentId })
        );
      }
    }
    
    await Promise.all(assignments);
    showAssignModal.value = false;
    selectedStudents.value = [];
    await loadStudentsData();
    await loadStudentTeachersData();
    showSuccess('Öğrenciler eğitmenlere atandı!');
  } catch (error: any) {
    showError(error.response?.data?.message || 'Atama işlemi başarısız oldu!');
  } finally {
    assigning.value = false;
  }
};

const handleExport = () => {
  console.log('Export students');
  // Export functionality
};

const handleAddStudent = () => {
  showCreateStudentModal.value = true;
  newStudent.value = {
    name: '',
    email: '',
    password: ''
  };
};


const closeCreateStudentModal = () => {
  showCreateStudentModal.value = false;
  newStudent.value = {
    name: '',
    email: '',
    password: ''
  };
};

const handleCreateStudentModalUpdate = (value: boolean) => {
  showCreateStudentModal.value = value;
};

const createStudent = async () => {
  try {
    const studentData = {
      ...newStudent.value,
      role: 'student'
    };
    
    const res = await api.post('/auth/admin/users', studentData);
    students.value.push({ ...res.data, password: '' });
    closeCreateStudentModal();
    showSuccess('Öğrenci başarıyla oluşturuldu!');
  } catch (e: any) {
    showError(e.response?.data?.message || 'Öğrenci oluşturma işlemi başarısız');
  }
};

const openStudentDetailModal = async (student: any) => {
  selectedStudentDetail.value = student;
  
  // Load fresh teacher assignment data for this student
  try {
    const response = await api.get(`/teachers/student/${student._id}/teachers`);
    selectedStudentTeachers.value = response.data || [];
  } catch (error) {
    console.error(`Error loading teachers for student ${student._id}:`, error);
    selectedStudentTeachers.value = [];
  }
  
  showStudentDetailModal.value = true;
};

const closeStudentDetailModal = () => {
  showStudentDetailModal.value = false;
  selectedStudentDetail.value = null;
  selectedStudentTeachers.value = [];
};

const handleStudentDetailModalUpdate = (value: boolean) => {
  showStudentDetailModal.value = value;
};

onMounted(async () => {
  await Promise.all([loadStudentsData(), loadTeachersData()]);
  await loadStudentTeachersData();
});
</script>

<style scoped lang="scss">

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.header-content {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 6px 0;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-student-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.student-detail-content {
  .student-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .info-section {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--border-secondary);
    }
  }
  
  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    
    label {
      font-weight: 500;
      color: var(--text-secondary);
      min-width: 100px;
    }
    
    span {
      color: var(--text-primary);
    }
    
    .role-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
  }
  
  .teachers-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .teacher-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    padding: 12px 16px;
    transition: all 0.3s ease;
    
    .teacher-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .teacher-name {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .teacher-email {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }
  
  .no-teachers {
    text-align: center;
    padding: 32px 16px;
    color: var(--text-tertiary);
    
    .material-symbols-outlined {
      font-size: 32px;
      margin-bottom: 8px;
      display: block;
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

.assign-btn {
  margin-top: 1em;
}

.student-name {
  .name-text {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.student-email {
  color: var(--text-secondary);
  font-size: 14px;
}

.teacher-badges {
  .teacher-count {
    background: #dbeafe;
    color: #1e40af;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .no-teacher {
    color: var(--text-tertiary);
    font-size: 12px;
    font-style: italic;
  }
}

/* Action buttons styles */
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 14px;
  transition: background-color 0.2s ease;
  width: 100%;
  opacity: 0.8;
  text-align: left;
  
    &:hover {
      opacity: 1;
  }
  
  
  .material-symbols-outlined {
    font-size: 16px;
  }
}

/* Table row hover effect for double-click indication */
:deep(.table-row) {
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--bg-secondary);
  }
}

.empty-students {
  text-align: center;
  padding: 40px 20px;
  
  .empty-icon {
    margin-bottom: 16px;
    
    .material-symbols-outlined {
      font-size: 48px;
      color: #d1d5db;
    }
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }
}
</style>