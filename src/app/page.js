"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      setAnswer(data.question_received);
    } catch (error) {
      setAnswer("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">
              🤖 AI Document Assistant
            </h1>
            <p className="text-sm text-slate-400">
              Chat with your documents using AI
            </p>
          </div>

          <div className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-400">
            ● API Online
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Ask questions about your documents
          </h2>

          <p className="mt-4 text-slate-400">
            Upload a document and let AI help you understand it.
          </p>
        </div>

        {/* Upload Card */}
        <div className="mb-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center">
          <div className="mb-4 text-5xl">📄</div>

          <h3 className="text-lg font-semibold">
            Upload your PDF
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            PDF upload functionality will be added next.
          </p>

          <button
            onClick={() => console.log("Upload PDF clicked")}
            className="mt-6 rounded-lg bg-white px-5 py-2.5 font-medium text-slate-900 transition hover:bg-slate-200 active:scale-95"
          >
            Choose PDF
          </button>
        </div>

        {/* Question Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <label className="mb-3 block text-sm font-medium text-slate-300">
            Ask your question
          </label>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. What is artificial intelligence?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAskAI();
                }
              }}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            <button
              onClick={handleAskAI}
              disabled={loading || !question.trim()}
              className="min-w-28 rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
        </div>

        {/* Answer */}
        {answer && (
          <div className="mt-8 rounded-2xl border border-blue-500/20 bg-slate-900 p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🤖</span>

              <h3 className="font-semibold">
                AI Response
              </h3>
            </div>

            <p className="leading-7 text-slate-300">
              {answer}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}