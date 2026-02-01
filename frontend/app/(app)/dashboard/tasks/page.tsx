"use client";

import { useState } from "react";
import TaskCard, { Task } from "@/components/TaskCard";
import AddTask from "@/components/AddTask";

const initialTasks: Task[] = [
  { id: "1", title: "Design the landing page wireframes", completed: true, createdAt: "2026-01-26T08:00:00Z" },
  { id: "2", title: "Set up CI/CD pipeline for staging", completed: false, createdAt: "2026-01-26T09:30:00Z" },
  { id: "3", title: "Review pull request #42 for auth module", completed: true, createdAt: "2026-01-25T14:00:00Z" },
  { id: "4", title: "Write unit tests for user registration", completed: false, createdAt: "2026-01-25T10:00:00Z" },
  { id: "5", title: "Update API documentation for v2 endpoints", completed: false, createdAt: "2026-01-24T16:00:00Z" },
  { id: "6", title: "Fix responsive layout on mobile dashboard", completed: true, createdAt: "2026-01-24T11:00:00Z" },
  { id: "7", title: "Implement dark mode toggle", completed: false, createdAt: "2026-01-23T09:00:00Z" },
  { id: "8", title: "Optimize database queries for task listing", completed: true, createdAt: "2026-01-23T08:00:00Z" },
];

type FilterValue = "all" | "active" | "completed";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterValue>("all");

  const handleAdd = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEdit = (id: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );
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

  return (
    <div className="space-y-6">
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
      <AddTask onAdd={handleAdd} />

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
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
