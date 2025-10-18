// Question types - use i18n keys instead of static labels
export const QUESTION_TYPES = [
  { labelKey: "questionBank.allQuestions", value: "" },
  { labelKey: "questionBank.singleChoice", value: "single_choice" },
  { labelKey: "questionBank.multipleChoice", value: "multiple_select" },
  { labelKey: "questionBank.trueFalse", value: "true_false" },
  { labelKey: "questionBank.openEnded", value: "open_ended" },
] as const;

// Difficulty levels - use i18n keys instead of static labels
export const DIFFICULTY_LEVELS = [
  { labelKey: "questionBank.allQuestions", value: "" },
  { labelKey: "questionBank.easy", value: "easy" },
  { labelKey: "questionBank.medium", value: "medium" },
  { labelKey: "questionBank.hard", value: "hard" },
] as const;

export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export const EXAM_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

// Status labels should use i18n keys in components:
// upcoming -> t('exams.upcoming')
// active -> t('exams.active')
// completed -> t('exams.completed')

export const STATUS_COLORS = {
  [EXAM_STATUS.UPCOMING]: "upcoming",
  [EXAM_STATUS.ACTIVE]: "active",
  [EXAM_STATUS.COMPLETED]: "completed",
} as const;

export const PAGINATION_DEFAULTS = {
  pageSize: 10,
  pageSizes: [10, 25, 50, 100],
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    USERS: "/auth/admin/users",
    STATS: "/auth/stats",
  },
  EXAMS: {
    LIST: "/exams",
    CREATE: "/exams",
    DETAIL: (id: string) => `/exams/${id}`,
    ADD_QUESTIONS: (id: string) => `/exams/${id}/add-questions`,
    ASSIGN_STUDENTS: (id: string) => `/exams/${id}/assign-students`,
  },
  QUESTIONS: {
    LIST: "/questions",
    CREATE: "/questions",
  },
  TEACHERS: {
    LIST: "/teachers",
    ASSIGN_STUDENTS: (id: string) => `/teachers/${id}/students`,
  },
} as const;
