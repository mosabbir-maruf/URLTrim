"use client";

import { useState } from "react";
import { ArrowRight, Copy, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json() as { error?: string; shortUrl?: string; shortCode?: string };

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult({ shortUrl: data.shortUrl!, shortCode: data.shortCode! });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 space-y-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative flex items-center bg-white dark:bg-neutral-900 rounded-2xl p-2 border border-neutral-200 dark:border-neutral-800 shadow-sm focus-within:ring-2 focus-within:ring-neutral-900 dark:focus-within:ring-neutral-100 transition-all">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="flex-1 bg-transparent px-4 py-3 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none text-lg"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className="ml-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Shorten"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3 p-6 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-100 dark:border-green-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between gap-4">
            <div className="truncate">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Your shortened URL is ready!</p>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-green-900 dark:text-green-100 hover:underline truncate block"
              >
                {result.shortUrl}
              </a>
            </div>
            <button
              onClick={copyToClipboard}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shrink-0",
                copied
                  ? "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100"
                  : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy link"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
