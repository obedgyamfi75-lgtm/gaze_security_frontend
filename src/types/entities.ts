// =============================================================================
// SECOPS PLATFORM - SHARED TYPES
// =============================================================================
// All types used across the application for backend integration

// =============================================================================
// BASE TYPES
// =============================================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Criticality = "critical" | "high" | "medium" | "low";
export type Environment = "production" | "staging" | "development";
export type AssetType = "web" | "api" | "mobile" | "cloud" | "database";

// =============================================================================
// USER & AUTH
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "manager" | "analyst" | "viewer" | "developer";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// =============================================================================
// PRODUCT
// =============================================================================

export interface ProductOwnerRef {
  id: string;
  name: string;
  email: string;
}

export interface ProductTeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  status: ProductStatus;
  criticality: Criticality;
  owner: ProductOwnerRef;
  ownerId: string;
  securityScore: number;
  compliance: string[];
  teamMembers: ProductTeamMember[];
  assetsCount: number;
  findingsCount: FindingsCount;
  lastAssessment?: string;
  nextAssessment?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = "active" | "development" | "deprecated" | "archived";

// =============================================================================
// ASSET
// =============================================================================

export interface Asset {
  id: string;
  name: string;
  description?: string;
  type: AssetType;
  environment: Environment;
  criticality: Criticality;
  status: AssetStatus;
  url?: string;
  ipAddress?: string;
  technologies: string[];
  owner: string;
  product: ProductRef;
  productId: string;
  findingsCount: FindingsCount;
  lastAssessment?: string;
  nextAssessment: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetStatus = "secure" | "moderate" | "at-risk" | "unknown";

export interface ProductRef {
  id: string;
  name: string;
  shortName: string;
}

// =============================================================================
// ASSESSMENT
// =============================================================================

export interface Assessment {
  id: string;
  name: string;
  description?: string;
  type: AssessmentType;
  status: AssessmentStatus;
  priority: Criticality;
  progress: number;
  asset: AssetRef;
  assetId: string;
  product: ProductRef;
  productId: string;
  assignee: UserRef;
  assigneeId: string;
  findings: Finding[];
  findingsCount: FindingsCount;
  scope?: string;
  methodology?: string;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssessmentType = 
  | "penetration_test"
  | "vulnerability_assessment"
  | "code_review"
  | "configuration_review"
  | "compliance_audit"
  | "red_team"
  | "purple_team"
  | "web_application"
  | "mobile_application"
  | "api"
  | "infrastructure"
  | "cloud";

export type AssessmentStatus = "planned" | "in_progress" | "pending_review" | "completed" | "cancelled";

export interface AssetRef {
  id: string;
  name: string;
  type: AssetType;
}

export interface UserRef {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar?: string;
}

// =============================================================================
// FINDING
// =============================================================================

export interface Finding {
  id: string;
  title: string;
  description?: string;
  severity: Severity;
  status: FindingStatus;
  cvssScore?: number;
  cvssVector?: string;
  cweId?: string;
  cveId?: string;
  owaspCategory?: string;
  asset?: AssetRef | null;
  assetId?: string;
  assessment?: AssessmentRef | null;
  assessmentId?: string;
  product?: ProductRef | null;
  productId?: string;
  assignee?: UserRef | null;
  assigneeId?: string;
  affectedComponent?: string;
  affectedUrl?: string;
  affectedParameter?: string;
  stepsToReproduce?: string;
  pocCode?: string;
  impact?: string;
  remediation?: string;
  recommendation?: string;
  remediationNotes?: string;
  rootCause?: string;
  references?: string[];
  tags?: string[];
  evidence?: Evidence[];
  evidenceCount?: number;
  slaDueDate?: string;
  slaStatus?: string;
  isOverdue?: boolean;
  daysUntilDue?: number | null;
  resolvedAt?: string;
  remediatedAt?: string;
  verifiedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FindingStatus = 
  | "open"
  | "in_progress"
  | "remediated"
  | "verified"
  | "false_positive"
  | "accepted"
  | "duplicate";

export interface AssessmentRef {
  id: string;
  name: string;
}

export interface Evidence {
  id: string;
  type: "screenshot" | "request" | "response" | "code" | "note" | "file";
  filename?: string;
  description?: string;
  content?: string;
  url?: string;
  createdAt: string;
}

// =============================================================================
// REPORT
// =============================================================================

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  assessment?: AssessmentRef;
  assessmentId?: string;
  product?: ProductRef;
  productId?: string;
  generatedBy: UserRef;
  downloadUrl?: string;
  fileSize?: number;
  createdAt: string;
}

export type ReportType = "executive" | "technical" | "full" | "compliance" | "custom";
export type ReportFormat = "pdf" | "docx" | "xlsx" | "html";
export type ReportStatus = "pending" | "generating" | "completed" | "failed";

// =============================================================================
// AUDIT LOG
// =============================================================================

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName?: string;
  user: UserRef;
  userId: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type AuditAction = 
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "status_change";

// =============================================================================
// DASHBOARD & STATS
// =============================================================================

export interface DashboardStats {
  findings: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    bySeverity: FindingsCount;
  };
  assessments: {
    total: number;
    inProgress: number;
    completed: number;
    planned: number;
  };
  assets: {
    total: number;
    atRisk: number;
    secure: number;
  };
  products: {
    total: number;
    avgSecurityScore: number;
  };
  sla: {
    overdue: number;
    dueThisWeek: number;
    complianceRate: number;
  };
}

export interface FindingsCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface TrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total?: number;
}

export interface ActivityItem {
  id: string;
  type: "finding" | "assessment" | "asset" | "report" | "user";
  action: string;
  description: string;
  user: UserRef;
  timestamp: string;
  entityId?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

// =============================================================================
// FILTER & QUERY TYPES
// =============================================================================

export interface QueryParams {
  [key: string]: unknown;
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FindingsQueryParams extends QueryParams {
  severity?: Severity | Severity[];
  status?: FindingStatus | FindingStatus[];
  productId?: string;
  assetId?: string;
  assessmentId?: string;
  assigneeId?: string;
  tag?: string;
}

export interface AssessmentsQueryParams extends QueryParams {
  status?: AssessmentStatus | AssessmentStatus[];
  type?: AssessmentType | AssessmentType[];
  productId?: string;
  assetId?: string;
  assigneeId?: string;
}

export interface AssetsQueryParams extends QueryParams {
  type?: AssetType | AssetType[];
  status?: AssetStatus | AssetStatus[];
  // environment?: Environment | Environment[];
  productId?: string;
  criticality?: Criticality | Criticality[];
}

export interface ProductsQueryParams extends QueryParams {
  status?: ProductStatus | ProductStatus[];
  criticality?: Criticality | Criticality[];
}

// =============================================================================
// FORM TYPES (for create/update)
// =============================================================================

export interface CreateFindingInput {
  title: string;
  description: string;
  severity: Severity;
  assessmentId?: string | null;
  cweId?: string;
  cveId?: string;
  affectedComponent?: string;
  affectedUrl?: string;
  stepsToReproduce?: string;
  impact?: string;
  cvssScore?: number;
  recommendation?: string;
  tags?: string[];
}

export interface UpdateFindingInput extends Partial<CreateFindingInput> {
  status?: FindingStatus;
  assigneeId?: string;
  pocCode?: string;
  remediationNotes?: string;
}

export interface CreateAssetInput {
  name: string;
  description?: string;
  type: AssetType;
  environment: Environment;
  criticality: Criticality;
  productId: string;
  url?: string;
  technologies?: string[];
  owner?: string;
}

export interface CreateAssessmentInput {
  name: string;
  description?: string;
  type: AssessmentType;
  assetId: string | null;
  assigneeId?: string | null;
  startDate: string;
  dueDate: string;
  scope?: string;
  methodology?: string;
}

export interface CreateProductInput {
  name: string;
  shortName: string;
  description?: string;
  criticality: Criticality;
  ownerId: string;
  compliance?: string[];
}