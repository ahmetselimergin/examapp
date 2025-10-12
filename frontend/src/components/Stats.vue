<template>
  <div class="reports-grid">
    <div class="report-card">
      <div class="report-icon">
        <i class="icon-exam">📚</i>
      </div>
      <div class="report-content">
        <div class="report-number">{{ stats.totalExams }}</div>
        <div class="report-label">{{ t('home.examsCreated') }}</div>
      </div>
    </div>
    
    <div class="report-card">
      <div class="report-icon">
        <i class="icon-students">👥</i>
      </div>
      <div class="report-content">
        <div class="report-number">{{ stats.totalStudents }}</div>
        <div class="report-label">{{ t('home.activeStudents') }}</div>
      </div>
    </div>
    
    <div class="report-card">
      <div class="report-icon">
        <i class="icon-questions">📝</i>
      </div>
      <div class="report-content">
        <div class="report-number">{{ stats.totalQuestions || 0 }}</div>
        <div class="report-label">{{ t('home.questionsAdded') }}</div>
      </div>
    </div>
    
    <div class="report-card">
      <div class="report-icon">
        <i class="icon-completion">📊</i>
      </div>
      <div class="report-content">
        <div class="report-number">{{ completionRate }}%</div>
        <div class="report-label">{{ t('home.completionRate') }}</div>
      </div>
    </div>
  </div>
</template>

   
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../services/api';

const { t } = useI18n();

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalExams: 0,
      totalStudents: 0,
      totalQuestions: 0,
      activeExams: 0
    })
  }
});

const completionRate = computed(() => {
  if (props.stats.totalExams === 0) return 0;
  return Math.round((props.stats.activeExams / props.stats.totalExams) * 100);
});
</script>

<style lang="scss" scoped>
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.report-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--border-secondary);
  }

  .report-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    flex-shrink: 0;

    i {
      display: block;
    }
  }

  .report-content {
    flex: 1;

    .report-number {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 4px;
    }

    .report-label {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }

  &:nth-child(1) .report-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &:nth-child(2) .report-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &:nth-child(3) .report-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &:nth-child(4) .report-icon {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .report-card {
    padding: 20px;

    .report-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }

    .report-content .report-number {
      font-size: 24px;
    }
  }
}
</style>
