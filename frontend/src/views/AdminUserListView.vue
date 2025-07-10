<template>
     <div>
          <div class="header">
               <h2>Kullanıcı Listesi (Admin)</h2>
               <Button @click="openCreateUserModal" variant="primary">Yeni Kullanıcı</Button>
          </div>
          <div v-if="loading">Yükleniyor...</div>
          <div v-else-if="error" style="color:red">{{ error }}</div>
          <table v-else>
               <thead>
                    <tr>
                         <th>İsim</th>
                         <th>Email</th>
                         <th>Şifre</th>
                         <th>Rol</th>
                         <th>İşlemler</th>
                    </tr>
               </thead>
               <tbody>
                    <tr v-for="user in users" :key="user._id">
                         <td>
                              <input v-model="user.name" />
                         </td>
                         <td>
                              <input v-model="user.email" />
                         </td>
                         <td>
                              <input v-model="user.password" type="password" placeholder="Yeni şifre" />
                         </td>
                         <td>
                              <select v-model="user.role">
                                   <option value="student">student</option>
                                   <option value="teacher">teacher</option>
                                   <option value="admin">admin</option>
                              </select>
                         </td>
                         <td>
                              <button @click="updateUser(user)">Kaydet</button>
                              <button @click="deleteUser(user._id)">Sil</button>
                         </td>
                    </tr>
               </tbody>
          </table>

          <!-- Create User Modal -->
          <Modal 
               v-model="showCreateUserModal" 
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
                         <select v-model="newUser.role">
                              <option value="student">Öğrenci</option>
                              <option value="teacher">Öğretmen</option>
                              <option value="admin">Admin</option>
                         </select>
                    </div>
               </div>
               <template #footer>
                    <div class="modal-footer">
                         <Button @click="closeCreateUserModal" variant="secondary">İptal</Button>
                         <Button @click="createUser" variant="primary">Oluştur</Button>
                    </div>
               </template>
          </Modal>
     </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Modal from '../components/ui/Modal.vue';
import Input from '../components/ui/Input.vue';
import Button from '../components/ui/Button.vue';

const users = ref([]);
const loading = ref(true);
const error = ref('');
const showCreateUserModal = ref(false);
const newUser = ref({
     name: '',
     email: '',
     password: '',
     role: 'student'
});

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

const deleteUser = async (id) => {
     if (!confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
     try {
          await api.delete(`/auth/admin/users/${id}`);
          users.value = users.value.filter(u => u._id !== id);
     } catch (e) {
          alert(e.response?.data?.message || 'Silme işlemi başarısız');
     }
};

const updateUser = async (user) => {
     try {
          const updateData = {
               name: user.name,
               email: user.email,
               role: user.role
          };
          
          if (user.password) {
               updateData.password = user.password;
          }

          const res = await api.put(`/auth/admin/users/${user._id}`, updateData);
          Object.assign(user, { ...res.data, password: '' });
          alert('Kullanıcı güncellendi');
     } catch (e) {
          alert(e.response?.data?.message || 'Güncelleme işlemi başarısız');
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

const createUser = async () => {
     try {
          const res = await api.post('/auth/admin/users', newUser.value);
          users.value.push({ ...res.data, password: '' });
          closeCreateUserModal();
          alert('Kullanıcı başarıyla oluşturuldu');
     } catch (e) {
          alert(e.response?.data?.message || 'Kullanıcı oluşturma işlemi başarısız');
     }
};

onMounted(fetchUsers);
</script>

<style scoped>
.header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 1rem;
}

.create-user-form {
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

table {
     width: 100%;
     border-collapse: collapse;
     margin-top: 1rem;
}

th, td {
     padding: 0.75rem;
     text-align: left;
     border-bottom: 1px solid #e2e8f0;
}

th {
     font-weight: 600;
     background-color: #f8fafc;
}

input, select {
     padding: 0.5rem;
     border: 1px solid #e2e8f0;
     border-radius: 0.375rem;
     width: 100%;
}

button {
     padding: 0.5rem 1rem;
     border-radius: 0.375rem;
     font-weight: 500;
     cursor: pointer;
     margin-right: 0.5rem;
}

button:last-child {
     margin-right: 0;
}
</style>