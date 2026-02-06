"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth-client";
import { listTasks, createTask, updateTask, deleteTask } from "@/lib/api/tasks";
import type { Task } from "@/lib/api/types";

type FilterValue = "all" | "active" | "completed";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleReLogin = async () => {
    await signOutUser();
    router.push("/login");
  };

  const checkAuthError = (errorMsg: string) => {
    const msg = errorMsg.toLowerCase();
    return msg.includes("token") || msg.includes("auth") || msg.includes("unauthorized");
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsAuthError(false);
    try {
      const response = await listTasks();
      if (response.success) {
        setTasks(response.data.items);
      } else {
        if (checkAuthError(response.error.message)) {
          setIsAuthError(true);
          setError("Your session has expired. Please log in again.");
        } else {
          setError(response.error.message);
        }
      }
    } catch {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAdd = async (title: string) => {
    if (!title.trim()) return;
    setIsAddingTask(true);
    try {
      const response = await createTask({ title: title.trim() });
      if (response.success) {
        setTasks((prev) => [response.data, ...prev]);
        setNewTaskTitle("");
        setIsExpanded(false);
      } else {
        setError(response.error.message);
      }
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const response = await updateTask(id, { completed: !task.completed });
      if (!response.success) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t))
        );
        setError(response.error.message);
      }
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t))
      );
      setError("Failed to update task. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const response = await deleteTask(id);
      if (!response.success) {
        // Revert on error
        setTasks((prev) => [...prev, taskToDelete]);
        setError(response.error.message);
      }
    } catch {
      // Revert on error
      setTasks((prev) => [...prev, taskToDelete]);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleEdit = async (id: string, title: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || !title.trim()) return;

    const oldTitle = task.title;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: title.trim() } : t))
    );
    setEditingId(null);

    try {
      const response = await updateTask(id, { title: title.trim() });
      if (!response.success) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, title: oldTitle } : t))
        );
        setError(response.error.message);
      }
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: oldTitle } : t))
      );
      setError("Failed to update task. Please try again.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  const filters: { value: FilterValue; label: string; count: number }[] = [
    { value: "all", label: "All", count: totalCount },
    { value: "active", label: "Active", count: activeCount },
    { value: "completed", label: "Completed", count: completedCount },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">Loading your tasks...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className={`rounded-lg border p-4 ${isAuthError ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAuthError ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              <p className={`text-sm ${isAuthError ? "text-amber-700" : "text-red-700"}`}>{error}</p>
            </div>
            <div className="flex items-center gap-2">
              {isAuthError ? (
                <button
                  onClick={handleReLogin}
                  className="text-sm font-medium text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors"
                >
                  Log in again
                </button>
              ) : (
                <button
                  onClick={fetchTasks}
                  className="text-sm font-medium text-red-700 hover:text-red-800 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setError(null)}
                className={`${isAuthError ? "text-amber-500 hover:text-amber-700" : "text-red-500 hover:text-red-700"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize all your tasks in one place.
          </p>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-2">
          <span className="badge badge-blue">{activeCount} active</span>
          <span className="badge badge-green">{completedCount} done</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              filter === f.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${filter === f.value ? "text-gray-500" : "text-gray-400"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Add task */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-4 text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/30 transition-all group"
        >
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-primary-400 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          Add a new task...
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd(newTaskTitle);
          }}
          className="rounded-xl border-2 border-primary-200 bg-primary-50/30 p-4"
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setNewTaskTitle("");
                setIsExpanded(false);
              }
            }}
            placeholder="What needs to be done?"
            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            autoFocus
            disabled={isAddingTask}
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setNewTaskTitle("");
                setIsExpanded(false);
              }}
              className="btn btn-ghost btn-sm"
              disabled={isAddingTask}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isAddingTask}
              className="btn btn-primary btn-sm"
            >
              {isAddingTask ? "Adding..." : "Add task"}
            </button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {filter === "completed" ? "No completed tasks yet" : filter === "active" ? "All tasks completed!" : "No tasks yet"}
            </h3>
            <p className="text-sm text-gray-500">
              {filter === "active"
                ? "Great job! You've completed everything."
                : "Click the button above to create your first task."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-sm ${
                task.completed
                  ? "border-gray-100 bg-gray-50/50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(task.id)}
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  task.completed
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 hover:border-primary-400 hover:bg-primary-50"
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => {
                      if (editTitle.trim() && editTitle !== task.title) {
                        handleEdit(task.id, editTitle);
                      } else {
                        setEditingId(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (editTitle.trim() && editTitle !== task.title) {
                          handleEdit(task.id, editTitle);
                        } else {
                          setEditingId(null);
                        }
                      }
                      if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    className="w-full text-sm bg-transparent border-b border-primary-300 focus:outline-none focus:border-primary-500 pb-0.5"
                    autoFocus
                  />
                ) : (
                  <p
                    className={`text-sm leading-relaxed ${
                      task.completed ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                    onDoubleClick={() => {
                      if (!task.completed) {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                      }
                    }}
                  >
                    {task.title}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">{formatDate(task.created_at)}</span>
                  {task.completed && (
                    <span className="badge badge-green">Completed</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!task.completed && (
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
