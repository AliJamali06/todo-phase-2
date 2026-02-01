"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const stats = [
  {
    label: "Total Tasks",
    value: 12,
    change: "+3 this week",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Completed",
    value: 8,
    change: "67% done",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-green-50 text-green-600",
  },
  {
    label: "In Progress",
    value: 4,
    change: "33% remaining",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-yellow-50 text-yellow-600",
  },
];

const recentTasks = [
  { id: "1", title: "Design the landing page wireframes", completed: true, date: "Today" },
  { id: "2", title: "Set up CI/CD pipeline for staging", completed: false, date: "Today" },
  { id: "3", title: "Review pull request #42", completed: true, date: "Yesterday" },
  { id: "4", title: "Write unit tests for auth module", completed: false, date: "Yesterday" },
  { id: "5", title: "Update API documentation", completed: false, date: "2 days ago" },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {session?.user?.name || "there"}
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s what&apos;s happening with your tasks today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tasks and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Tasks</h2>
            <Link
              href="/dashboard/tasks"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    task.completed
                      ? "border-green-500 bg-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className={`flex-1 text-sm ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {task.title}
                </span>
                <span className="text-xs text-gray-400">{task.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Add New Task</p>
                <p className="text-xs text-gray-500">Create a task quickly</p>
              </div>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-50/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Progress</p>
                <p className="text-xs text-gray-500">Check your stats</p>
              </div>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
              <span className="text-sm font-semibold text-primary-600">67%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: "67%" }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">8 of 12 tasks completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
