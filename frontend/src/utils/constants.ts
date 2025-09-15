export const QUESTION_TYPES = [
  { label: "Tümü", value: "" },
  { label: "Çoktan Tek Seçmeli", value: "single_choice" },
  { label: "Çoktan Çok Seçmeli", value: "multiple_select" },
  { label: "Doğru/Yanlış", value: "true_false" },
  { label: "Kısa Cevap", value: "open_ended" },
] as const;

export const DIFFICULTY_LEVELS = [
  { label: "Tümü", value: "" },
  { label: "Kolay", value: "easy" },
  { label: "Orta", value: "medium" },
  { label: "Zor", value: "hard" },
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

export const STATUS_LABELS = {
  [EXAM_STATUS.UPCOMING]: "Yakında",
  [EXAM_STATUS.ACTIVE]: "Aktif",
  [EXAM_STATUS.COMPLETED]: "Tamamlandı",
} as const;

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
