<template>
  <div class="users-container">
    <div class="page-header">
      <div class="header-content">
        <h2>Kullanıcı Listesi</h2>
        <p>Kullanıcıları yönetin ve düzenleyin</p>
      </div>
      <div class="header-actions">
        <Button 
          type="button" 
          styleType="primary" 
          size="medium" 
          @click="openCreateUserModal" 
          icon="add" 
          text="Yeni Kullanıcı" 
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Kullanıcılar yükleniyor...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <DataTable
        :data="filteredUsers"
        :columns="columns"
        :loading="loading"
        :actions="true"
        @selection-change="handleSelectionChange"
      >
        <template #actions="{ item, closeMenu }">
          <button @click="editUser(item); closeMenu()" class="action-btn ">
            <span class="material-symbols-outlined">edit</span>
            Edit
          </button>
          <button @click="deleteUser(item); closeMenu()" class="action-btn ">
            <span class="material-symbols-outlined">delete</span>
            Delete
          </button>
        </template>
        
        <template #empty>
          <Empty 
            icon="person_off"
            title="Kullanıcı bulunamadı"
            description="Gösterilecek kullanıcı bulunmuyor."
            :show-action="false"
          />
        </template>
      </DataTable>
    </div>

          <!-- Create User Modal -->
          <Modal 
               :modelValue="showCreateUserModal" 
               @update:modelValue="handleCreateUserModalUpdate"
               title="Yeni Kullanıcı Oluştur"
          >
               <div class="create-user-form">
                    <div class="form-group">
                         <label>Ad Soyad</label>
                         <Input v-model="newUser.name" placeholder="Ad Soyad" />
                    </div>
                    <div class="form-group">
                         <label>E-posta</label>
                         <Input v-model="newUser.email" type="email" placeholder="E-posta" />
                    </div>
                    <div class="form-group">
                         <label>Şifre</label>
                         <Input v-model="newUser.password" type="password" placeholder="Şifre" />
                    </div>
                    <div class="form-group">
                         <label>Rol</label>
                         <Select 
                              v-model="newUser.role" 
                              :options="roleFormOptions"
                              placeholder="Rol seçiniz"
                         />
                    </div>
               </div>
               <template #footer>
                    <div class="modal-footer">
                         <Button @click="closeCreateUserModal" variant="secondary">İptal</Button>
                         <Button @click="createUser" variant="primary">Oluştur</Button>
                    </div>
                </template>
           </Modal>

           <!-- Edit User Modal -->
           <Modal 
                :modelValue="showEditUserModal" 
                @update:modelValue="handleEditUserModalUpdate"
                title="Kullanıcı Düzenle"
           >
                <div class="edit-user-form">
                     <div class="form-group">
                          <label>Ad Soyad</label>
                          <Input v-model="editingUser.name" placeholder="Ad Soyad" />
                     </div>
                     <div class="form-group">
                          <label>E-posta</label>
                          <Input v-model="editingUser.email" type="email" placeholder="E-posta" />
                     </div>
                     <div class="form-group">
                          <label>Şifre (Boş bırakırsanız değişmez)</label>
                          <Input v-model="editingUser.password" type="password" placeholder="Yeni şifre (opsiyonel)" />
                     </div>
                     <div class="form-group">
                          <label>Rol</label>
                          <Select 
                               v-model="editingUser.role" 
                               :options="roleFormOptions"
                               placeholder="Rol seçiniz"
                          />
                     </div>
                </div>
                <template #footer>
                     <div class="modal-footer">
                          <Button @click="closeEditUserModal" variant="secondary">İptal</Button>
                          <Button @click="updateUser" variant="primary">Güncelle</Button>
                     </div>
                 </template>
            </Modal>

           <!-- Confirmation Modal -->
           <ConfirmationModal
                :isOpen="showDeleteModal"
                @update:isOpen="showDeleteModal = $event"
                title="Kullanıcıyı Sil"
                :message="`${userToDelete?.name} adlı kullanıcıyı silmek istediğinizden emin misiniz?`"
                :details="`E-posta: ${userToDelete?.email}`"
                confirmText="Evet, Sil"
                cancelText="İptal"
                confirmStyle="danger"
                icon="delete_forever"
                :loading="deleting"
                @confirm="confirmDelete"
                @cancel="cancelDelete"
           />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import Modal from '../components/ui/Modal.vue';
import ConfirmationModal from '../components/ui/ConfirmationModal.vue';
import Empty from '../components/ui/Empty.vue';
import Input from '../components/ui/Input.vue';
import Button from '../components/ui/Button.vue';
import Select from '../components/ui/Select.vue';
import DataTable from '../components/ui/DataTable.vue';
import { useToast } from '../composables/useToast';

const authStore = useAuthStore();
const { showSuccess, showError } = useToast();

// Data refs
const users = ref([]);
const loading = ref(true);
const error = ref('');
const showCreateUserModal = ref(false);
const showEditUserModal = ref(false);
const showDeleteModal = ref(false);
const userToDelete = ref(null);
const deleting = ref(false);
const search = ref('');
const roleFilter = ref('');
const selectedUsers = ref([]);

const newUser = ref({
     name: '',
     email: '',
     password: '',
     role: 'student'
});

const editingUser = ref({
     _id: '',
     name: '',
     email: '',
     password: '',
     role: 'student'
});

// Role options for filter
const roleOptions = ref([
  { label: 'Tüm Roller', value: '' },
  { label: 'Öğrenci', value: 'student' },
  { label: 'Öğretmen', value: 'teacher' },
  { label: 'Admin', value: 'admin' }
]);

// Role options for form select
const roleFormOptions = ref([
  { label: 'Öğrenci', value: 'student' },
  { label: 'Öğretmen', value: 'teacher' },
  { label: 'Admin', value: 'admin' }
]);

// DataTable columns
const columns = ref([
  {
    key: 'name',
    label: 'Ad Soyad',
    sortable: true
  },
  {
    key: 'email',
    label: 'E-posta',
    sortable: true
  },
  {
    key: 'role',
    label: 'Rol',
    sortable: true,
    formatter: (value) => {
      const roleMap = {
        'student': 'Öğrenci',
        'teacher': 'Öğretmen',
        'admin': 'Admin'
      };
      return roleMap[value] || value;
    }
  },
  // Actions column removed - using actions prop instead
]);

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  if (search.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email.toLowerCase().includes(search.value.toLowerCase())
    );
  }
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value);
  }
  
  return filtered;
});

// Methods
const fetchUsers = async () => {
     loading.value = true;
     try {
          const res = await api.get('/auth/admin/users');
          users.value = res.data.map(user => ({
               ...user,
               password: ''
          }));
     } catch (e) {
          error.value = e.response?.data?.message || 'Kullanıcılar alınamadı';
     } finally {
          loading.value = false;
     }
};

const handleSelectionChange = (selected) => {
  selectedUsers.value = selected;
};

const deleteUser = (user) => {
     userToDelete.value = user;
     showDeleteModal.value = true;
};

const confirmDelete = async () => {
     if (!userToDelete.value) return;

     deleting.value = true;
     try {
          await api.delete(`/auth/admin/users/${userToDelete.value._id}`);
          showSuccess('Kullanıcı başarıyla silindi!');
          await fetchUsers();
          showDeleteModal.value = false;
          userToDelete.value = null;
     } catch (e) {
          showError(e.response?.data?.message || 'Silme işlemi başarısız');
     } finally {
          deleting.value = false;
     }
};

const cancelDelete = () => {
     userToDelete.value = null;
     showDeleteModal.value = false;
};

const updateUser = async () => {
     try {
          const updateData = {
               name: editingUser.value.name,
               email: editingUser.value.email,
               role: editingUser.value.role
          };
          
          if (editingUser.value.password) {
               updateData.password = editingUser.value.password;
          }

          const res = await api.put(`/auth/admin/users/${editingUser.value._id}`, updateData);
          
          // Update the user in the users array
          const index = users.value.findIndex(u => u._id === editingUser.value._id);
          if (index !== -1) {
               users.value[index] = { ...res.data, password: '' };
          }
          
          closeEditUserModal();
          showSuccess('Kullanıcı başarıyla güncellendi!');
     } catch (e) {
          showError(e.response?.data?.message || 'Güncelleme işlemi başarısız');
     }
};

const openCreateUserModal = () => {
     showCreateUserModal.value = true;
     newUser.value = {
          name: '',
          email: '',
          password: '',
          role: 'student'
     };
};

const closeCreateUserModal = () => {
     showCreateUserModal.value = false;
};

const handleCreateUserModalUpdate = (value) => {
     showCreateUserModal.value = value;
};

const createUser = async () => {
     try {
          const res = await api.post('/auth/admin/users', newUser.value);
          users.value.push({ ...res.data, password: '' });
          closeCreateUserModal();
          showSuccess('Kullanıcı başarıyla oluşturuldu!');
     } catch (e) {
          showError(e.response?.data?.message || 'Kullanıcı oluşturma işlemi başarısız');
     }
};

const editUser = (user) => {
     editingUser.value = {
          _id: user._id,
          name: user.name,
          email: user.email,
          password: '',
          role: user.role
     };
     showEditUserModal.value = true;
};

const openEditUserModal = () => {
     showEditUserModal.value = true;
};

const closeEditUserModal = () => {
     showEditUserModal.value = false;
     editingUser.value = {
          _id: '',
          name: '',
          email: '',
          password: '',
          role: 'student'
     };
};

const handleEditUserModalUpdate = (value) => {
     showEditUserModal.value = value;
};

onMounted(fetchUsers);
</script>

<style scoped>

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 6px 0;
  }
  
  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  font-weight: 400;
}

.create-user-form,
.edit-user-form {
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

.loading {
  text-align: center;
  padding: 24px;
}

.error {
  color: red;
  text-align: center;
  padding: 24px;
}

.no-users {
  text-align: center;
  color: #888;
  padding: 24px;
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
  color: #374151;
  font-size: 14px;
  transition: background-color 0.2s ease;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: #f3f4f6;
  }
  
 
  .material-symbols-outlined {
    font-size: 16px;
  }
}
</style>