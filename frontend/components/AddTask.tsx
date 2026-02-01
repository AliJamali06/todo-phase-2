"use client";

import { useState } from "react";

interface AddTaskProps {
  onAdd: (title: string) => void;
}

export default function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setTitle("");
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
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
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border-2 border-primary-200 bg-primary-50/30 p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setIsExpanded(false);
          }}
          className="btn btn-ghost btn-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="btn btn-primary btn-sm"
        >
          Add task
        </button>
      </div>
    </form>
  );
}
