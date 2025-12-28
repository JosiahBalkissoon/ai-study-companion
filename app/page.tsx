export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <main className="w-full max-w-3xl border border-gray-700 rounded-xl p-8 bg-black space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Study Companion
        </h1>

        <p className="text-gray-300 text-lg">
          Upload your notes or PDFs. Practice with smart, exam-style quizzes.
          Built for real students, not demos.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="/courses"
            className="inline-flex items-center justify-center rounded bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
          >
            Go to Courses →
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
      </main>
    </div>
  );
}