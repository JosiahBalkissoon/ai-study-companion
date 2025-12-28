'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [showToast, setShowToast] = useState(false);

  // Auto-hide toast after 2.5s
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <main className="relative w-full max-w-3xl border border-gray-700 rounded-xl p-8 bg-black space-y-6">
        
        {/* ✅ Beta badge */}
        <div className="absolute -top-3 right-6">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold tracking-wide text-white">
            BETA
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          AI Study Companion
        </h1>

        <p className="text-gray-300 text-lg">
          Upload your notes or PDFs. Practice with smart, exam-style quizzes.
          Built for real students, not demos.
        </p>

        {/* Option A clarity */}
        <p className="text-sm text-gray-400">
          No account required. Your progress stays on your device.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="/courses"
            onClick={() => setShowToast(true)}
            className="inline-flex items-center justify-center rounded bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
          >
            Go to Courses →
          </a>

          {/* 🐞 Feedback / Feature Request */}
          <a
            href="https://forms.gle/43WVnYQWNHe9NvSE8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-gray-600 px-6 py-3 font-semibold text-white hover:bg-gray-800 transition"
          >
            Report a bug / Suggest a feature
          </a>

          <a
            href="https://github.com/JosiahBalkissoon/ai-study-companion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-gray-600 px-6 py-3 font-semibold text-white hover:bg-gray-800 transition"
          >
            View on GitHub
          </a>
        </div>

        <div className="pt-4 text-sm text-gray-400">
          Deployed with Vercel · Built with Next.js · Offline quiz engine
        </div>

        {/* ✅ Toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-gray-200 shadow-lg">
            Ready when you are. Let’s study 📚
          </div>
        )}
      </main>
    </div>
  );
}