<template>
  <div class="users-container">
    <div class="page-header">
      <div class="header-content">
        <h2>{{ t('users.title') }}</h2>
        <p>{{ t('users.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <Button 
          type="button" 
          styleType="primary" 
          size="medium" 
          @click="openCreateUserModal" 
          icon="add" 
          :text="t('users.newUser')" 
        />
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('users.loading') }}</div>
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
            {{ t('common.edit') }}
          </button>
          <button @click="deleteUser(item); closeMenu()" class="action-btn ">
            <span class="material-symbols-outlined">delete</span>
            {{ t('common.delete') }}
          </button>
        </template>
        
        <template #empty>
          <Empty 
            icon="person_off"
            :title="t('users.noUsers')"
            :description="t('users.noUsersDescription')"
            :show-action="false"
          />
        </template>
      </DataTable>
    </div>

          <!-- Create User Modal -->
          <Modal 
               :modelValue="showCreateUserModal" 
               @update:modelValue="handleCreateUserModalUpdate"
               :title="t('users.createUser')"
          >
               <div class="create-user-form">
                    <div class="form-group">
                         <label>{{ t('users.fullName') }}</label>
                         <Input 
                              v-model="newUser.name" 
                              :placeholder="t('users.fullName')"
                              autocomplete="off"
                         />
                    </div>
                    <div class="form-group">
                         <label>{{ t('users.email') }}</label>
                         <Input 
                              v-model="newUser.email" 
                              type="email" 
                              :placeholder="t('users.email')"
                              autocomplete="new-password"
                         />
                    </div>
                    <div class="form-group">
                         <label>{{ t('users.password') }}</label>
                         <Input 
                              v-model="newUser.password" 
                              type="password" 
                              :placeholder="t('users.password')"
                              autocomplete="new-password"
                         />
                    </div>
                    <div class="form-group">
                         <label>{{ t('users.role') }}</label>
                         <Select 
                              v-model="newUser.role" 
                              :options="roleFormOptions"
                              :placeholder="t('users.selectRole')"
                         />
                    </div>
               </div>
               <template #footer>
                    <div class="modal-footer">
                         <Button @click="closeCreateUserModal" variant="secondary">{{ t('common.cancel') }}</Button>
                         <Button @click="createUser" variant="primary">{{ t('common.create') }}</Button>
                    </div>
                </template>
           </Modal>

           <!-- Edit User Modal -->
           <Modal 
                :modelValue="showEditUserModal" 
                @update:modelValue="handleEditUserModalUpdate"
                :title="t('users.editUser')"
           >
                <div class="edit-user-form">
                     <div class="form-group">
                          <label>{{ t('users.fullName') }}</label>
                          <Input 
                               v-model="editingUser.name" 
                               :placeholder="t('users.fullName')"
                               autocomplete="off"
                          />
                     </div>
                     <div class="form-group">
                          <label>{{ t('users.email') }}</label>
                          <Input 
                               v-model="editingUser.email" 
                               type="email" 
                               :placeholder="t('users.email')"
                               autocomplete="off"
                          />
                     </div>
                     <div class="form-group">
                          <label>{{ t('users.passwordOptional') }}</label>
                          <Input 
                               v-model="editingUser.password" 
                               type="password" 
                               :placeholder="t('users.newPassword')"
                               autocomplete="new-password"
                          />
                     </div>
                     <div class="form-group">
                          <label>{{ t('users.role') }}</label>
                          <Select 
                               v-model="editingUser.role" 
                               :options="roleFormOptions"
                               :placeholder="t('users.selectRole')"
                          />
                     </div>
                </div>
                <template #footer>
                     <div class="modal-footer">
                          <Button @click="closeEditUserModal" variant="secondary">{{ t('common.cancel') }}</Button>
                          <Button @click="updateUser" variant="primary">{{ t('common.update') }}</Button>
                     </div>
                 </template>
            </Modal>

           <!-- Confirmation Modal -->
           <ConfirmationModal
                :isOpen="showDeleteModal"
                @update:isOpen="showDeleteModal = $event"
                :title="t('users.deleteUser')"
                :message="t('users.confirmDelete', { name: userToDelete?.name })"
                :details="t('users.emailDetail', { email: userToDelete?.email })"
                :confirmText="t('common.delete')"
                :cancelText="t('common.cancel')"
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
import { useI18n } from 'vue-i18n';
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

const { t } = useI18n();
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
  { label: t('users.allRoles'), value: '' },
  { label: t('user.student'), value: 'student' },
  { label: t('user.teacher'), value: 'teacher' },
  { label: t('user.admin'), value: 'admin' }
]);

// Role options for form select
const roleFormOptions = ref([
  { label: t('user.student'), value: 'student' },
  { label: t('user.teacher'), value: 'teacher' },
  { label: t('user.admin'), value: 'admin' }
]);

// DataTable columns
const columns = ref([
  {
    key: 'name',
    label: t('users.fullName'),
    sortable: true
  },
  {
    key: 'email',
    label: t('users.email'),
    sortable: true
  },
  {
    key: 'role',
    label: t('users.role'),
    sortable: true,
    formatter: (value) => {
      const roleMap = {
        'student': t('user.student'),
        'teacher': t('user.teacher'),
        'admin': t('user.admin')
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
          error.value = e.response?.data?.message || t('users.fetchError');
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
          showSuccess(t('users.deleteSuccess'));
          await fetchUsers();
          showDeleteModal.value = false;
          userToDelete.value = null;
     } catch (e) {
          showError(e.response?.data?.message || t('users.deleteError'));
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
          showSuccess(t('users.updateSuccess'));
     } catch (e) {
          showError(e.response?.data?.message || t('users.updateError'));
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
          showSuccess(t('users.createSuccess'));
     } catch (e) {
          showError(e.response?.data?.message || t('users.createError'));
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
  color: var(--text-primary);
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