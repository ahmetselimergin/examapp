<template>
  <div class="dashboard">
    <div class="welcome-section">
      <h1>Hoş Geldiniz, {{ authStore.user?.name }}</h1>
      <p class="subtitle">Sınav yönetim sisteminize hoş geldiniz</p>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <Stats v-if="authStore.user?.role === 'admin'" />
        </div>
        <div class="col-md-4 col-12">
          <QuickActions  v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'teacher')" />
        </div>
      </div>
    </div>

   

    <!--
    <div class="recent-exams">
      <h2>Son Sınavlar</h2>
      <div v-if="loading" class="loading">Yükleniyor...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="exams-list">
        <div v-for="exam in recentExams" :key="exam._id" class="exam-item" @click="viewExam(exam._id)">
          <div class="exam-info">
            <h3>{{ exam.title }}</h3>
            <p>{{ exam.description }}</p>
          </div>
          <div class="exam-meta">
            <span>{{ formatDate(exam.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
    -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import Stats from '../components/Stats.vue';
import QuickActions from '../components/QuickActions.vue';
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref('');
const recentExams = ref([]);

const stats = ref({
  totalExams: 0,
  activeExams: 0
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR');
};

const viewExam = (examId) => {
  router.push(`/exams/${examId}`);
};

const fetchStats = async () => {
  try {
    const [examsRes] = await Promise.all([
      api.get('/exams')
    ]);

    stats.value = {
      totalExams: examsRes.data.length,
      activeExams: examsRes.data.filter(exam => exam.status === 'active').length
    };

    recentExams.value = examsRes.data.slice(0, 5);
  } catch (e) {
    error.value = e.response?.data?.message || 'Veriler alınamadı';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStats);
</script>

<style scoped lang="scss">
.dashboard {
  margin: 1em auto;
}

.welcome-section {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #666;
    font-size: 1.1rem;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 4px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid #e9e9e9;

  .stat-icon {
    font-size: 2rem;
  }

  .stat-content {
    h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    p {
      color: #666;
      font-size: 0.9rem;
    }
  }
}

.quick-actions {
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  
  background: white;
    border-radius: 4px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid #e9e9e9;

  .action-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    font-size: 0.9rem;
  }
}

.recent-exams {
  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.exams-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exam-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .exam-info {
    h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    p {
      color: #666;
      font-size: 0.9rem;
    }
  }

  .exam-meta {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #888;
  }
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc2626;
}
</style> 