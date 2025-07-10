<template>
  <div>
    <h1>Öğrenci Listesi</h1>
    <table>
      <thead>
        <tr>
          <th>Ad</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student._id">
          <td>{{ student.name }}</td>
          <td>{{ student.email }}</td>
          <td>{{ student.role }}</td>
          <td>
            <button @click="deleteStudent(student._id)">Sil</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const students = ref([]);

const loadStudents = async () => {
  const response = await api.get('/auth/admin/users');
  students.value = response.data.filter((user: any) => user.role === 'student');
};

const deleteStudent = async (id: string) => {
  if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
    await api.delete(`/auth/admin/users/${id}`);
    await loadStudents();
  }
};

onMounted(loadStudents);
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
button {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #c0392b;
}
</style>