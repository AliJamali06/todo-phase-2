/**
 * API client with JWT token injection.
 *
 * Handles authentication headers and error responses.
 */
import { getToken } from "@/lib/auth-client";
import type { ErrorResponse, ApiResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Debug logging for API URL
if (typeof window !== "undefined") {
  console.log("API URL:", API_URL);
}

/**
 * Base fetch function with authentication.
 */
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_URL}/api${endpoint}`;
  console.log(`API Request: ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);

  return response;
}

/**
 * Parse API response and handle errors.
 */
async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.ok) {
    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true, data: null as T };
    }

    const data = await response.json();
    return { success: true, data };
  }

  // Handle error responses - include status code in error
  const statusCode = response.status;
  const statusText = response.statusText;

  try {
    const error = (await response.json()) as ErrorResponse | { detail: ErrorResponse };
    const errorResponse = "detail" in error ? error.detail : error;
    return {
      success: false,
      error: {
        error_code: errorResponse.error_code || `HTTP_${statusCode}`,
        message: errorResponse.message || `Request failed: ${statusText}`,
        details: errorResponse.details,
      },
    };
  } catch {
    return {
      success: false,
      error: {
        error_code: `HTTP_${statusCode}`,
        message: `Request failed: ${statusText}`,
      },
    };
  }
}

/**
 * API client methods.
 */
export const apiClient = {
  /**
   * GET request.
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(endpoint, { method: "GET" });
    return parseResponse<T>(response);
  },

  /**
   * POST request.
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return parseResponse<T>(response);
  },

  /**
   * PUT request.
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return parseResponse<T>(response);
  },

  /**
   * PATCH request.
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return parseResponse<T>(response);
  },

  /**
   * DELETE request.
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetchWithAuth(endpoint, { method: "DELETE" });
    return parseResponse<T>(response);
  },
};
