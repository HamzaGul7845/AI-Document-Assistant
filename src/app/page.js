"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState("");

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
      if (!response.ok) {
  throw new Error("Failed to get AI answer");
}

      const data = await response.json();

      setAnswer(data.answer);
    } catch (error) {
      setAnswer("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
  if (!selectedFile) {
    setUploadError("Please select a PDF first.");
    return;
  }

  setUploading(true);
  setUploadError("");
  setUploadResult(null);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("PDF upload failed");
    }

    const data = await response.json();

    setUploadResult(data);
    console.log("Upload successful:", data);
  } catch (error) {
    console.error(error);
    setUploadError("Unable to upload PDF. Please try again.");
  } finally {
    setUploading(false);
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
    Select a PDF to extract and store its content for AI search.
  </p>

  <input
    type="file"
    accept=".pdf,application/pdf"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;

      setSelectedFile(file);
      setUploadResult(null);
      setUploadError("");

      if (file && file.type !== "application/pdf") {
        setSelectedFile(null);
        setUploadError("Only PDF files are allowed.");
      }
    }}
    className="mt-6 block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
  />

  {selectedFile && (
    <p className="mt-4 text-sm text-slate-300">
      Selected: {selectedFile.name}
    </p>
  )}

  <button
    onClick={handleUpload}
    disabled={!selectedFile || uploading}
    className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {uploading ? "Processing PDF..." : "Upload PDF"}
  </button>

  {uploadResult && (
    <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-left text-sm text-green-300">
      <p className="font-semibold">
        ✓ PDF processed successfully!
      </p>

      <p className="mt-2">
        Filename: {uploadResult.filename}
      </p>

      <p>
        Total chunks: {uploadResult.total_chunks}
      </p>

      <p>
        Embedding dimensions: {uploadResult.embedding_dimension}
      </p>
    </div>
  )}

  {uploadError && (
    <p className="mt-4 text-sm text-red-400">
      {uploadError}
    </p>
  )}

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