import axios from "axios";
import {
  AuthResponse,
  BulkEmailRequest,
  BulkEmailResponse,
  EmailHistoryResponse,
  EmailHistoryStats,
  GmailStatus,
  LoginRequest,
  ProcessCSVResponse,
  RegisterRequest,
  SendEmailRequest,
} from "../types";

const API_BASE_URL = "https://gmail-email-app-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post("/auth/register", data).then((res) => res.data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post("/auth/login", data).then((res) => res.data),

  getProfile: () => api.get("/profile").then((res) => res.data),
};

export const gmailAPI = {
  getAuthUrl: () => api.get("/gmail/auth-url").then((res) => res.data),

  getStatus: (): Promise<GmailStatus> =>
    api.get("/gmail/status").then((res) => res.data),

  sendEmail: (data: SendEmailRequest) =>
    api.post("/gmail/send", data).then((res) => res.data),

  processCSV: (file: File): Promise<ProcessCSVResponse> => {
    const formData = new FormData();
    formData.append("csv_file", file);
    return api
      .post("/gmail/process-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  },

  sendBulkEmails: (data: BulkEmailRequest): Promise<BulkEmailResponse> =>
    api.post("/gmail/send-bulk", data).then((res) => res.data),

  getEmailHistory: (
    page: number = 1,
    pageSize: number = 20,
    type?: string
  ): Promise<EmailHistoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (type) {
      params.append("type", type);
    }
    return api
      .get(`/gmail/history?${params.toString()}`)
      .then((res) => res.data);
  },

  getEmailHistoryStats: (): Promise<EmailHistoryStats> =>
    api.get("/gmail/history/stats").then((res) => res.data),
};

export default api;
