// =============================================================================
// API ENDPOINTS
// =============================================================================

import api from "./client";
import type {
  User,
  Product,
  Asset,
  Assessment,
  Finding,
  Report,
  AuditLog,
  DashboardStats,
  TrendData,
  ActivityItem,
  PaginatedResponse,
  ProductsQueryParams,
  AssetsQueryParams,
  AssessmentsQueryParams,
  FindingsQueryParams,
  CreateProductInput,
  CreateAssetInput,
  CreateAssessmentInput,
  CreateFindingInput,
  UpdateFindingInput,
} from "@/types";

// =============================================================================
// AUTH API
// =============================================================================

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; requiresMfa: boolean }>("/auth/login", { email, password }),

  verifyMfa: (code: string) =>
    api.post<{ user: User }>("/auth/mfa/verify", { code }),

  logout: () => 
    api.post("/auth/logout"),

  me: () => 
    api.get<User>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),

  setupMfa: () => 
    api.post<{ secret: string; qrCode: string }>("/auth/mfa/setup"),

  enableMfa: (code: string) => 
    api.post("/auth/mfa/enable", { code }),

  disableMfa: (code: string) => 
    api.post("/auth/mfa/disable", { code }),
};

// =============================================================================
// DASHBOARD API
// =============================================================================

export const dashboardApi = {
  getStats: () => 
    api.get<DashboardStats>("/dashboard/stats"),

  getTrends: (days?: number) =>
    api.get<TrendData[]>("/dashboard/trends", { days }),

  getRecentActivity: (limit?: number) =>
    api.get<ActivityItem[]>("/dashboard/activity", { limit }),

  getSlaStatus: () =>
    api.get<{ complianceRate: number; overdue: number; atRisk: number }>("/dashboard/sla"),
};

// =============================================================================
// PRODUCTS API
// =============================================================================

export const productsApi = {
  list: (params?: ProductsQueryParams) =>
    api.get<PaginatedResponse<Product>>("/products", params),

  get: (id: string) => 
    api.get<Product>(`/products/${id}`),

  create: (data: CreateProductInput) => 
    api.post<Product>("/products", data),

  update: (id: string, data: Partial<CreateProductInput>) =>
    api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => 
    api.delete(`/products/${id}`),

  getAssets: (id: string) => 
    api.get<Asset[]>(`/products/${id}/assets`),

  getFindings: (id: string) => 
    api.get<Finding[]>(`/products/${id}/findings`),

  getTeam: (id: string) => 
    api.get<User[]>(`/products/${id}/team`),
};

// =============================================================================
// ASSETS API
// =============================================================================

export const assetsApi = {
  list: (params?: AssetsQueryParams) =>
    api.get<PaginatedResponse<Asset>>("/assets", params),

  get: (id: string) => 
    api.get<Asset>(`/assets/${id}`),

  create: (data: CreateAssetInput) => 
    api.post<Asset>("/assets/new", data),

  update: (id: string, data: Partial<CreateAssetInput>) =>
    api.put<Asset>(`/assets/${id}`, data),

  delete: (id: string) => 
    api.delete(`/assets/${id}`),

  getFindings: (id: string) => 
    api.get<Finding[]>(`/assets/${id}/findings`),
};

// =============================================================================
// ASSESSMENTS API
// =============================================================================

export const assessmentsApi = {
  list: (params?: AssessmentsQueryParams) =>
    api.get<PaginatedResponse<Assessment>>("/assessments", params),

  get: (id: string) => 
    api.get<Assessment>(`/assessments/${id}`),

  create: (data: CreateAssessmentInput) => 
    api.post<Assessment>("/assessments/new", data),

  update: (id: string, data: Partial<CreateAssessmentInput>) =>
    api.put<Assessment>(`/assessments/${id}`, data),

  delete: (id: string) => 
    api.delete(`/assessments/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch<Assessment>(`/assessments/${id}/status`, { status }),

  getFindings: (id: string) => 
    api.get<Finding[]>(`/assessments/${id}/findings`),

  generateReport: (id: string, type: "executive" | "technical") =>
    api.post<Report>(`/reports/generate`, { assessmentId: id, type, format: "pdf" }),
};

// =============================================================================
// FINDINGS API
// =============================================================================

export const findingsApi = {
  list: (params?: FindingsQueryParams) =>
    api.get<PaginatedResponse<Finding>>("/findings", params),

  get: (id: string) => 
    api.get<Finding>(`/findings/${id}`),

  create: (data: CreateFindingInput) => 
    api.post<Finding>("/findings/new", data),

  update: (id: string, data: UpdateFindingInput) =>
    api.put<Finding>(`/findings/${id}`, data),

  delete: (id: string) => 
    api.delete(`/findings/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch<Finding>(`/findings/${id}/status`, { status }),

  addEvidence: (id: string, formData: FormData) =>
    api.upload<{ id: string; url: string }>(`/findings/${id}/evidence`, formData),

  deleteEvidence: (findingId: string, evidenceId: string) =>
    api.delete(`/findings/${findingId}/evidence/${evidenceId}`),
};

// =============================================================================
// REPORTS API
// =============================================================================

export const reportsApi = {
  list: (params?: { page?: number; perPage?: number }) =>
    api.get<PaginatedResponse<Report>>("/reports", params),

  get: (id: string) => 
    api.get<Report>(`/reports/${id}`),

  generate: (data: { 
    assessmentId?: string; 
    productId?: string; 
    type: string; 
    format: string 
    name?: string;
    options?: {
      include_evidence?: boolean;
      include_remediation?: boolean;
      include_metrics?: boolean;
      include_timeline?: boolean;
    };
  }) => api.post<Report>("/reports/generate", data),

  download: (id: string) =>
    api.download(`/reports/${id}/download`),

  delete: (id: string) => 
    api.delete(`/reports/${id}`),
};

// =============================================================================
// USERS API (Admin)
// =============================================================================

export const usersApi = {
  list: (params?: { page?: number; perPage?: number; search?: string; role?: string }) =>
    api.get<PaginatedResponse<User>>("/admin/users", params),

  get: (id: string) => 
    api.get<User>(`/admin/users/${id}`),

  create: (data: { email: string; firstName: string; lastName: string; role: string }) =>
    api.post<User>("/admin/users/new", data),

  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/admin/users/${id}`, data),

  delete: (id: string) => 
    api.delete(`/admin/users/${id}`),

  resetPassword: (id: string) =>
    api.post(`/admin/users/${id}/reset-password`),
    
  updateRole: (id: string, role: string) =>
    api.post(`/admin/users/${id}/role`, { role }),
    
  unlock: (id: string) =>
    api.post(`/admin/users/${id}/unlock`),
    
  deactivate: (id: string) =>
    api.post(`/admin/users/${id}/deactivate`),
};

// =============================================================================
// AUDIT LOGS API (Admin)
// =============================================================================

export const auditLogsApi = {
  list: (params?: { page?: number; perPage?: number; userId?: string; action?: string; entityType?: string }) =>
    api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", params),

  get: (id: string) => 
    api.get<AuditLog>(`/admin/audit-logs/${id}`),
};

// =============================================================================
// SETTINGS API
// =============================================================================

export const settingsApi = {
  get: () =>
    api.get<Record<string, unknown>>("/admin/settings"),

  update: (data: Record<string, unknown>) =>
    api.put("/admin/settings", data),

  getBranding: () =>
    api.get<Record<string, unknown>>("/admin/settings/branding"),

  updateBranding: (data: Record<string, unknown>) =>
    api.put("/admin/settings/branding", data),
};