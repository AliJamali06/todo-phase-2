/**
 * Task API functions.
 *
 * Provides typed functions for all task operations.
 */
import { apiClient } from "./client";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskListParams,
  ApiResponse,
} from "./types";

/**
 * Create a new task.
 *
 * @param data - Task creation data (title required)
 * @returns Created task or error
 */
export async function createTask(data: TaskCreate): Promise<ApiResponse<Task>> {
  return apiClient.post<Task>("/todos", data);
}

/**
 * List tasks for the current user.
 *
 * @param params - Optional filters (completed, limit, offset)
 * @returns List of tasks or error
 */
export async function listTasks(
  params: TaskListParams = {}
): Promise<ApiResponse<TaskListResponse>> {
  const searchParams = new URLSearchParams();

  if (params.completed !== undefined) {
    searchParams.set("completed", String(params.completed));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  const endpoint = query ? `/todos?${query}` : "/todos";

  return apiClient.get<TaskListResponse>(endpoint);
}

/**
 * Get a single task by ID.
 *
 * @param taskId - Task UUID
 * @returns Task or error
 */
export async function getTask(taskId: string): Promise<ApiResponse<Task>> {
  return apiClient.get<Task>(`/todos/${taskId}`);
}

/**
 * Update a task.
 *
 * @param taskId - Task UUID
 * @param data - Update data (title and/or completed)
 * @returns Updated task or error
 */
export async function updateTask(
  taskId: string,
  data: TaskUpdate
): Promise<ApiResponse<Task>> {
  return apiClient.put<Task>(`/todos/${taskId}`, data);
}

/**
 * Delete a task.
 *
 * @param taskId - Task UUID
 * @returns Success or error
 */
export async function deleteTask(taskId: string): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/todos/${taskId}`);
}

/**
 * Toggle task completion status.
 *
 * @param taskId - Task UUID
 * @returns Updated task or error
 */
export async function toggleComplete(taskId: string): Promise<ApiResponse<Task>> {
  return apiClient.patch<Task>(`/todos/${taskId}/complete`);
}
