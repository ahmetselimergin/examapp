import { defineStore } from "pinia";
import api from "../services/api";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem("token") || null,
    error: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", { email, password });
        this.token = res.data.token;
        this.user = res.data.user;
        localStorage.setItem("token", res.data.token);
      } catch (err: any) {
        console.error("Login error:", err);
        this.error = err.response?.data?.message || "Login failed";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async register(userData: {
      email: string;
      password: string;
      name: string;
      role?: string;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/register", userData);
        this.token = res.data.token;
        this.user = res.data;
        localStorage.setItem("token", res.data.token);
      } catch (err: any) {
        this.error = err.response?.data?.message || "Register failed";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserProfile() {
      if (!this.token) {
        throw new Error("No authentication token found");
      }
      try {
        const res = await api.get("/auth/profile");
        if (res.data) {
          this.user = res.data;
        } else {
          throw new Error("No user data received");
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Profile fetch failed";
        throw err;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
    },
    async validateToken() {
      if (!this.token) {
        return false;
      }
      try {
        const res = await api.get("/auth/profile");
        if (res.data) {
          this.user = res.data;
          return true;
        }
        return false;
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          this.logout();
        }
        return false;
      }
    },
  },
});
