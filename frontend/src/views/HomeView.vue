<template>
  <div class="dashboard-container">
    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1>{{ $t('home.goodMorning') }}, {{ userDisplayName }}</h1>
          <p>{{ $t('home.haveNiceDay') }}</p>
        </div>
        <div class="banner-illustration">
          <div class="illustration-bg">
            <span class="material-symbols-outlined">school</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="dashboard-left">
        <!-- Weekly Reports -->
        <div v-if="authStore.user?.role === 'admin'" class="reports-section">
          <div class="section-header">
            <h2>{{ $t('home.weeklyReports') }}</h2>
            <select class="time-filter">
              <option value="1week">{{ $t('home.oneWeek') }}</option>
              <option value="1month">{{ $t('home.oneMonth') }}</option>
            </select>
          </div>
          
          <Stats :stats="stats" />
        </div>

        <!-- Recent Activity Table -->
        <div class="activity-section">
          <div class="section-header">
            <h2>{{ $t('home.recentExams') }}</h2>
          </div>
          
          <div class="activity-table">
            <div class="table-header">
              <div class="col-name">{{ $t('common.name') }}</div>
              <div class="col-subject">{{ $t('home.subject') }}</div>
              <div class="col-date">{{ $t('common.date') }}</div>
              <div class="col-time">{{ $t('common.time') }}</div>
              <div class="col-status">{{ $t('common.status') }}</div>
              <div class="col-actions"></div>
            </div>
            
            <div class="table-body">
              <div 
                v-for="exam in recentExams" 
                :key="exam.id || exam._id"
                class="table-row"
              >
                <div class="col-name">
                  <div class="exam-info">
                    <span class="exam-title">{{ exam.title }}</span>
                  </div>
                </div>
                <div class="col-subject">{{ exam.subject || 'General' }}</div>
                <div class="col-date">{{ formatDate(exam.startTime) }}</div>
                <div class="col-time">{{ formatTime(exam.startTime) }}</div>
                <div class="col-status">
                  <span class="status-badge" :class="exam.status">
                    <span class="material-symbols-outlined">{{ getStatusIcon(exam.status) }}</span>
                  </span>
                </div>
                <div class="col-actions">
                  <button class="action-menu" @click="showExamActions(exam)">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="dashboard-right">
        <!-- Calendar Widget -->
        <div class="calendar-widget">
          <div class="widget-header">
            <h3>{{ $t('home.scheduleCalendar') }}</h3>
          </div>
          
          <!-- Calendar Navigation -->
          <div class="calendar-nav">
            <button class="nav-btn" @click="previousMonth">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div class="month-year">
              <span class="month-name">{{ currentMonthName }}</span>
              <span class="year">{{ currentYear }}</span>
            </div>
            <button class="nav-btn" @click="nextMonth">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          
          <div class="calendar-grid">
            <div class="calendar-days">
              <div class="day-header">{{ $t('home.mon') }}</div>
              <div class="day-header">{{ $t('home.tue') }}</div>
              <div class="day-header">{{ $t('home.wed') }}</div>
              <div class="day-header">{{ $t('home.thu') }}</div>
              <div class="day-header">{{ $t('home.fri') }}</div>
              <div class="day-header">{{ $t('home.sat') }}</div>
              <div class="day-header">{{ $t('home.sun') }}</div>
            </div>
            <div class="calendar-dates">
              <div 
                v-for="date in calendarDates" 
                :key="date.date"
                class="calendar-date"
                :class="{ 
                  'today': date.isToday, 
                  'has-event': date.hasEvent,
                  'other-month': date.otherMonth,
                  'clickable': date.hasEvent
                }"
                @click="handleDateClick(date)"
              >
                {{ date.day }}
                <div v-if="date.hasEvent" class="event-dot"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Date Modal -->
    <div v-if="showDateModal" class="modal-overlay" @click="closeDateModal">
      <div class="date-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('home.examsOn') }} {{ selectedDate ? formatDate(selectedDate.toISOString()) : '' }}</h3>
          <button class="close-btn" @click="closeDateModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div v-if="selectedDateExams.length === 0" class="no-exams">
            <span class="material-symbols-outlined">event_busy</span>
            <p>{{ $t('home.noExamsThisDay') }}</p>
          </div>
          
          <div v-else class="exams-list">
            <div 
              v-for="exam in selectedDateExams" 
              :key="exam.id || exam._id"
              class="exam-item"
              @click="router.push(`/exams/${exam.id || exam._id}`)"
            >
              <div class="exam-info">
                <div class="exam-header">
                  <h4>{{ exam.title }}</h4>
                  <span class="exam-status" :class="getExamStatus(exam)">
                    <span class="material-symbols-outlined">{{ getStatusIcon(getExamStatus(exam)) }}</span>
                  </span>
                </div>
                <p class="exam-description">{{ exam.description || t('common.noDescription') }}</p>
                <div class="exam-details">
                  <div class="detail-item">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>{{ formatTime(exam.startTime) }} - {{ formatTime(exam.endTime) }}</span>
                  </div>
                  <div class="detail-item" v-if="exam.subject">
                    <span class="material-symbols-outlined">subject</span>
                    <span>{{ exam.subject }}</span>
                  </div>
                  <div class="detail-item" v-if="exam.duration">
                    <span class="material-symbols-outlined">timer</span>
                    <span>{{ exam.duration }} {{ $t('common.minutes') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import Stats from '../components/Stats.vue';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const stats = ref({
  totalExams: 0,
  activeExams: 0,
  totalStudents: 0,
  totalQuestions: 0
});

const weeklyStats = ref({
  examsCreated: 12,
  activeStudents: 156,
  questionsAdded: 89,
  completionRate: 87
});

const recentExams = ref([]);
const loading = ref(true);

const userDisplayName = computed(() => {
  const user = authStore.user;
  return user?.name || user?.email || t('common.user');
});

const filteredQuickActions = computed(() => [
  {
    id: 'create-exam',
    title: t('home.createExam'),
    description: t('home.createExamDesc'),
    icon: 'add_circle',
    route: '/exams/create',
    roles: ['admin', 'teacher']
  },
  {
    id: 'manage-students',
    title: t('home.manageStudents'),
    description: t('home.manageStudentsDesc'),
    icon: 'group',
    route: '/students',
    roles: ['admin', 'teacher']
  },
  {
    id: 'question-bank',
    title: t('home.questionBank'),
    description: t('home.questionBankDesc'),
    icon: 'quiz',
    route: '/questions',
    roles: ['admin', 'teacher']
  }
].filter(action => {
  const userRole = authStore.user?.role;
  return action.roles.includes(userRole);
}).slice(0, 3));

// Calendar data
const calendarDates = ref([]);
const showDateModal = ref(false);
const selectedDate = ref(null);
const selectedDateExams = ref([]);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

// Computed properties for calendar display
const currentMonthName = computed(() => {
  const monthNames = [
    t('home.january'), t('home.february'), t('home.march'), t('home.april'),
    t('home.may'), t('home.june'), t('home.july'), t('home.august'),
    t('home.september'), t('home.october'), t('home.november'), t('home.december')
  ];
  return monthNames[currentMonth.value];
});

// Navigation functions
const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  generateCalendarDates();
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  generateCalendarDates();
};

const generateCalendarDates = () => {
  const today = new Date();
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const dates = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Check if there are exams on this date
    const hasExamOnDate = recentExams.value.some(exam => {
      if (!exam.startTime) return false;
      const examDate = new Date(exam.startTime);
      return examDate.toDateString() === date.toDateString();
    });
    
    dates.push({
      date: date.toISOString(),
      day: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      hasEvent: hasExamOnDate,
      otherMonth: date.getMonth() !== currentMonth.value
    });
  }
  
  calendarDates.value = dates;
};

const handleDateClick = (date) => {
  if (!date.hasEvent) return;
  
  const clickedDate = new Date(date.date);
  selectedDate.value = clickedDate;
  
  // Filter exams for the selected date
  selectedDateExams.value = recentExams.value.filter(exam => {
    if (!exam.startTime) return false;
    const examDate = new Date(exam.startTime);
    return examDate.toDateString() === clickedDate.toDateString();
  });
  
  showDateModal.value = true;
};

const closeDateModal = () => {
  showDateModal.value = false;
  selectedDate.value = null;
  selectedDateExams.value = [];
};

const handleActionClick = (action) => {
  router.push(action.route);
};

const showReportsModal = () => {
  // TODO: Implement reports modal
};

const showQuickActionsModal = () => {
  // TODO: Implement quick actions modal
};

const showExamActions = (exam) => {
  // TODO: Implement exam actions menu
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusIcon = (status) => {
  const icons = {
    'active': 'play_circle',
    'completed': 'check_circle',
    'upcoming': 'schedule',
    'draft': 'edit'
  };
  return icons[status] || 'help';
};

const loadStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const loadRecentExams = async () => {
  try {
    const response = await api.get('/exams?limit=5');
    recentExams.value = response.data.map(exam => ({
      ...exam,
      id: exam._id, // MongoDB _id'yi id olarak map et
      status: getExamStatus(exam)
    }));
  } catch (error) {
    console.error('Error loading recent exams:', error);
  }
};

const getExamStatus = (exam) => {
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  
  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'completed';
  return 'active';
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    loadStats(),
    loadRecentExams()
  ]);
  // Generate calendar after exams are loaded
  generateCalendarDates();
  loading.value = false;
});
</script>

<style scoped lang="scss">
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

// Welcome Banner
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
  
  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  
  .welcome-text {
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    
    p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }
  }
  
  .banner-illustration {
    .illustration-bg {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .material-symbols-outlined {
        font-size: 40px;
        color: white;
      }
    }
  }
}

// Dashboard Grid
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

// Left Column
.dashboard-left {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

// Section Headers
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  .time-filter {
    background: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
}

// Reports Section
.reports-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}


// Activity Section
.activity-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.activity-table {
  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 60px;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-primary);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .table-body {
    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 60px;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-primary);
      align-items: center;
      transition: background-color 0.2s ease;
      
      &:hover {
        background: var(--bg-secondary);
        border-radius: 8px;
        margin: 0 -12px;
        padding: 16px 12px;
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
  
  .exam-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .exam-avatar {
      width: 40px;
      height: 40px;
      background: var(--bg-tertiary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .material-symbols-outlined {
        color: var(--text-secondary);
        font-size: 20px;
      }
    }
    
    .exam-title {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
  
  .col-subject, .col-date, .col-time {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    
    .material-symbols-outlined {
      font-size: 16px;
    }
    
    &.active {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }
    
    &.completed {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    
    &.upcoming {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }
    
    &.draft {
      background: rgba(156, 163, 175, 0.1);
      color: #9ca3af;
    }
  }
  
  .action-menu {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .material-symbols-outlined {
      font-size: 20px;
    }
  }
}

// Right Column
.dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// Widget Base
.calendar-widget,
.quick-actions-widget {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    color: var(--text-primary);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .performance-value {
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .add-btn {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    padding: 6px 12px;
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-tertiary);
    }
    
    .material-symbols-outlined {
      font-size: 16px;
    }
  }
}

// Calendar Widget
.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  
  .nav-btn {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);
    
    &:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-primary);
      color: var(--text-primary);
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
    
    .material-symbols-outlined {
      font-size: 18px;
    }
  }
  
  .month-year {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    
    .month-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .year {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
}

.calendar-grid {
  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
    
    .day-header {
      text-align: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 8px 4px;
      text-transform: uppercase;
    }
  }
  
  .calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  
  .calendar-date {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-secondary);
    }
    
    &.today {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }
    
    &.other-month {
      color: var(--text-tertiary);
    }
    
    &.clickable {
      cursor: pointer;
      
      &:hover {
        background: var(--bg-tertiary);
        transform: scale(1.05);
      }
    }
    
    &.has-event .event-dot {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
    }
  }
  
  .calendar-legend {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-secondary);
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      
      .legend-dot {
        width: 6px;
        height: 6px;
        background: #22c55e;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }
  }
}

// Quick Actions Widget
.actions-list {
  .action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: var(--bg-secondary);
    }
    
    .action-avatar {
      width: 36px;
      height: 36px;
      background: var(--bg-tertiary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .material-symbols-outlined {
        font-size: 18px;
        color: var(--text-secondary);
      }
    }
    
    .action-info {
      flex: 1;
      
      .action-name {
        display: block;
        color: var(--text-primary);
        font-weight: 500;
        font-size: 0.875rem;
      }
      
      .action-role {
        display: block;
        color: var(--text-secondary);
        font-size: 0.75rem;
        margin-top: 2px;
      }
    }
    
    .action-menu-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: var(--text-secondary);
      opacity: 0;
      transition: all 0.2s ease;
      
      .material-symbols-outlined {
        font-size: 16px;
      }
    }
    
    &:hover .action-menu-btn {
      opacity: 1;
      
      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }
  }
}

// Responsive Design
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .welcome-banner {
    padding: 20px;
    
    .banner-content {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }
    
    .welcome-text h1 {
      font-size: 1.75rem;
    }
  }
  
  .activity-table {
    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .col-subject,
    .col-date,
    .col-time,
    .col-actions {
      display: none;
    }
  }
  
  .dashboard-right {
    gap: 16px;
  }
}

// Date Modal
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.date-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary);

    h3 {
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      color: var(--text-secondary);
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .material-symbols-outlined {
        font-size: 20px;
      }
    }
  }

  .modal-content {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;

    .no-exams {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);

      .material-symbols-outlined {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 1rem;
      }
    }

    .exams-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .exam-item {
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid var(--border-secondary);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-primary);
        }

        .exam-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;

          h4 {
            color: var(--text-primary);
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0;
            flex: 1;
          }

          .exam-status {
            display: flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;

            &.active {
              background: rgba(34, 197, 94, 0.1);
              color: #22c55e;
            }

            &.upcoming {
              background: rgba(59, 130, 246, 0.1);
              color: #3b82f6;
            }

            &.completed {
              background: rgba(107, 114, 128, 0.1);
              color: #6b7280;
            }

            &.draft {
              background: rgba(245, 158, 11, 0.1);
              color: #f59e0b;
            }

            .material-symbols-outlined {
              font-size: 14px;
            }
          }
        }

        .exam-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .exam-details {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.75rem;
            color: var(--text-tertiary);

            .material-symbols-outlined {
              font-size: 16px;
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    width: 95%;
    margin: 20px;

    .modal-content {
      padding: 16px;

      .exams-list .exam-item {
        padding: 12px;

        .exam-details {
          .detail-item {
            font-size: 0.7rem;

            .material-symbols-outlined {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
