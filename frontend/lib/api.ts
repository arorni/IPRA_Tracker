/**
 * API client for IPRA backend.
 * Base URL points to FastAPI backend running on port 8000.
 * TODO Phase 2: Add JWT auth headers from session storage.
 */

import axios from "axios";
import type { IPRARequest, UploadedDocument, ImproveResponse, Agency } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// TODO Phase 2: Inject real JWT token from auth session
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ipra_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (email: string, password: string, full_name: string) =>
    api.post("/auth/signup", { email, password, full_name }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  me: () => api.get("/auth/me"),
};

// ── Agencies ──────────────────────────────────────────────────────────────────
export const agenciesApi = {
  list: () => api.get<Agency[]>("/agencies"),
  get: (id: string) => api.get<Agency>(`/agencies/${id}`),
};

// ── Requests ──────────────────────────────────────────────────────────────────
export const requestsApi = {
  list: () => api.get<IPRARequest[]>("/requests"),

  get: (id: string) => api.get<IPRARequest>(`/requests/${id}`),

  create: (data: {
    title: string;
    agency_name: string;
    agency_email?: string;
    agency_id?: string;
    submission_url?: string;
    description: string;
    request_text: string;
    notes?: string;
  }) => api.post<IPRARequest>("/requests", data),

  update: (id: string, data: Partial<IPRARequest>) =>
    api.put<IPRARequest>(`/requests/${id}`, data),

  delete: (id: string) => api.delete(`/requests/${id}`),

  markSubmitted: (
    id: string,
    data: {
      submission_method: string;
      submitted_date: string;
      agency_received_date?: string;
      request_identifier?: string;
      submission_notes?: string;
    }
  ) => api.post<IPRARequest>(`/requests/${id}/mark-submitted`, data),

  markReceived: (
    id: string,
    data: { agency_received_date: string }
  ) => api.post<IPRARequest>(`/requests/${id}/mark-received`, data),
};

// ── Deadlines ─────────────────────────────────────────────────────────────────
export const deadlinesApi = {
  getForRequest: (id: string) => api.get(`/requests/${id}/deadlines`),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsApi = {
  list: (requestId: string) =>
    api.get<UploadedDocument[]>(`/requests/${requestId}/documents`),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  improveRequest: (request_text: string, agency_name: string) =>
    api.post<ImproveResponse>("/ai/improve-request", { request_text, agency_name }),

  summarize: (document_text: string) =>
    api.post("/ai/summarize-document", { document_text }),

  suggestFollowUps: (original_request: string, document_summary?: string) =>
    api.post("/ai/suggest-followups", { original_request, document_summary }),
};
