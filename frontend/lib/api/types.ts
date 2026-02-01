/**
 * TypeScript types matching api.yaml contract.
 *
 * These types ensure type safety between frontend and backend.
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
}

export interface TaskUpdate {
  title?: string;
  completed?: boolean;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface TaskListParams {
  completed?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  error_code: string;
  message: string;
  details?: {
    errors: ValidationErrorDetail[];
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

export function isApiError<T>(
  response: ApiResponse<T>
): response is { success: false; error: ErrorResponse } {
  return !response.success;
}
