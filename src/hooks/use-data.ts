"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  dashboardApi,
  productsApi,
  assetsApi,
  assessmentsApi,
  findingsApi,
  reportsApi,
  usersApi,
  auditLogsApi,
} from "@/lib/api";
import type {
  Product,
  Asset,
  Assessment,
  Finding,
  Report,
  User,
  AuditLog,
  DashboardStats,
  TrendData,
  ActivityItem,
  PaginationMeta,
  ProductsQueryParams,
  AssetsQueryParams,
  AssessmentsQueryParams,
  FindingsQueryParams,
} from "@/types";

// =============================================================================
// GENERIC TYPES
// =============================================================================

interface UsePaginatedDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
  setPage: (page: number) => void;
  refetch: () => void;
}

interface UseSingleDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// =============================================================================
// DASHBOARD HOOKS
// =============================================================================

export function useDashboardStats(): UseSingleDataResult<DashboardStats> {
  const { data, error, isLoading, mutate } = useSWR(
    "dashboard/stats",
    () => dashboardApi.getStats().then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch dashboard stats");
      return r.data!;
    })
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

export function useTrends(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    ["dashboard/trends", days],
    () => dashboardApi.getTrends(days).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch trends");
      return r.data!;
    })
  );

  return {
    data: data ?? ([] as TrendData[]),
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

export function useRecentActivity(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    ["dashboard/activity", limit],
    () => dashboardApi.getRecentActivity(limit).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch activity");
      return r.data!;
    })
  );

  return {
    data: data ?? ([] as ActivityItem[]),
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// PRODUCTS HOOKS
// =============================================================================

export function useProducts(params?: ProductsQueryParams): UsePaginatedDataResult<Product> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["products", { ...params, page }],
    () => productsApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch products");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}

export function useProduct(id: string): UseSingleDataResult<Product> {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["product", id] : null,
    () => productsApi.get(id).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch product");
      return r.data!;
    })
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// ASSETS HOOKS
// =============================================================================

export function useAssets(params?: AssetsQueryParams): UsePaginatedDataResult<Asset> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["assets", { ...params, page }],
    () => assetsApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch assets");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}

export function useAsset(id: string): UseSingleDataResult<Asset> {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["asset", id] : null,
    () => assetsApi.get(id).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch asset");
      return r.data!;
    })
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// ASSESSMENTS HOOKS
// =============================================================================

export function useAssessments(params?: AssessmentsQueryParams): UsePaginatedDataResult<Assessment> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["assessments", { ...params, page }],
    () => assessmentsApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch assessments");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}

export function useAssessment(id: string): UseSingleDataResult<Assessment> {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["assessment", id] : null,
    () => assessmentsApi.get(id).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch assessment");
      return r.data!;
    })
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// FINDINGS HOOKS
// =============================================================================

export function useFindings(params?: FindingsQueryParams): UsePaginatedDataResult<Finding> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["findings", { ...params, page }],
    () => findingsApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch findings");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}

export function useFinding(id: string): UseSingleDataResult<Finding> {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["finding", id] : null,
    () => findingsApi.get(id).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch finding");
      return r.data!;
    })
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// REPORTS HOOKS
// =============================================================================

export function useReports(params?: { page?: number; perPage?: number }): UsePaginatedDataResult<Report> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["reports", { ...params, page }],
    () => reportsApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch reports");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// USERS HOOKS
// =============================================================================

export function useUsers(params?: { page?: number; perPage?: number; search?: string; role?: string }): UsePaginatedDataResult<User> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["users", { ...params, page }],
    () => usersApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch users");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}

// =============================================================================
// AUDIT LOGS HOOKS
// =============================================================================

export function useAuditLogs(params?: { page?: number; perPage?: number; userId?: string; action?: string }): UsePaginatedDataResult<AuditLog> {
  const [page, setPage] = useState(params?.page || 1);

  const { data, error, isLoading, mutate } = useSWR(
    ["audit-logs", { ...params, page }],
    () => auditLogsApi.list({ ...params, page }).then((r) => {
      if (!r.success) throw new Error(r.error || "Failed to fetch audit logs");
      return r.data!;
    })
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error: error?.message ?? null,
    meta: data?.meta ?? null,
    setPage,
    refetch: () => { mutate(); },
  };
}
