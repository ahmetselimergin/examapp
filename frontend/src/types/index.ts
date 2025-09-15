// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: "student";
  assignedTeachers?: Teacher[];
}

export interface Teacher extends User {
  role: "teacher";
  students?: Student[];
}

export interface Admin extends User {
  role: "admin";
}

// Exam Types
export interface Exam {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "upcoming" | "active" | "completed";
  createdBy: User;
  questions?: Question[];
  assignedStudents?: Student[];
  createdAt: string;
  updatedAt: string;
}

// Question Types
export interface Question {
  _id: string;
  text: string;
  type: "single_choice" | "multiple_select" | "true_false" | "open_ended";
  options?: string[];
  editorData?: any; // Rich text content from Editor.js
  correctAnswer?: string | string[];
  difficulty: "easy" | "medium" | "hard";
  points: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Student Answer Types
export interface StudentAnswer {
  _id: string;
  studentId: string;
  questionId: string;
  examId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
  submittedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface ExamFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface QuestionFormData {
  text: string;
  type: Question["type"];
  options?: string[];
  correctAnswer?: string | string[];
  difficulty: Question["difficulty"];
  points: number;
}

// Filter Types
export interface FilterOption {
  label: string;
  value: string;
}

export interface TableFilter {
  key: string;
  value: any;
  type: "text" | "select" | "date";
}

// Component Props Types
export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface StatusBadgeProps {
  status: string;
  type?: "exam" | "user" | "question" | "custom";
  customLabel?: string;
}

// Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Utility Types
export type UserRole = User["role"];
export type QuestionType = Question["type"];
export type QuestionDifficulty = Question["difficulty"];
export type ExamStatus = Exam["status"];
