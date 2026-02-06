"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">TaskFlow</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Help
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Terms
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            {currentYear} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
