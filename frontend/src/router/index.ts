import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import RegisterForm from "../components/auth/RegisterForm.vue";
import ProfileView from "../views/ProfileView.vue";
import ExamListView from "../views/ExamListView.vue";
import AdminUserListView from "../views/AdminUserListView.vue";
import ExamCreateView from "../views/ExamCreateView.vue";
import ExamDetailView from "../views/ExamDetailView.vue";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/LoginView.vue";
import Student from "../views/Student.vue";
import DashboardView from "../views/DashboardView.vue";

interface RouteMeta {
  requiresAuth?: boolean;
  allowedRoles?: string[];
  hideBreadcrumb?: boolean;
}

type CustomRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
};

const routes: CustomRouteRecordRaw[] = [
  { path: "/login", component: LoginView, meta: { hideBreadcrumb: true } },
  {
    path: "/register",
    component: RegisterForm,
    meta: { hideBreadcrumb: true },
  },
  { path: "/profile", component: ProfileView, meta: { requiresAuth: true } },
  { path: "/exams", component: ExamListView, meta: { requiresAuth: true } },
  {
    path: "/exams/create",
    component: ExamCreateView,
    meta: { requiresAuth: true, allowedRoles: ["teacher", "admin"] },
  },
  {
    path: "/exams/:id",
    component: ExamDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/exams/:id/student",
    name: "exam-student",
    component: () => import("../views/ExamStudentView.vue"),
    meta: { requiresAuth: true, allowedRoles: ["student"] },
  },
  {
    path: "/admin/users",
    component: AdminUserListView,
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    name: "home",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/students",
    name: "students",
    component: Student,
    meta: { requiresAuth: true, allowedRoles: ["teacher", "admin"] },
  },
  {
    path: "/question-bank",
    name: "question-bank",
    component: () => import("../views/QuestionBankView.vue"),
    meta: { requiresAuth: true, allowedRoles: ["teacher", "admin"] },
  },
  // Diğer sayfalar...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  if (to.path !== "/login" && to.path !== "/register" && !isAuthenticated) {
    next("/login");
  } else if (
    (to.path === "/login" || to.path === "/register") &&
    isAuthenticated
  ) {
    next("/");
  } else if (
    to.meta?.allowedRoles &&
    userRole &&
    Array.isArray(to.meta.allowedRoles) &&
    !to.meta.allowedRoles.includes(userRole)
  ) {
    next("/"); // Redirect to home if user's role is not allowed
  } else {
    next();
  }
});

export default router;
