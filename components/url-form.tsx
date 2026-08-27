"use client";

import { useState } from "react";
import { ArrowRight, Copy, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState("");

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
        body: JSON.stringify({ url, ...(customCode.trim() ? { customCode: customCode.trim() } : {}) }),
      });

      const data = await response.json() as { error?: string; shortUrl?: string; shortCode?: string };

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult({ shortUrl: data.shortUrl!, shortCode: data.shortCode! });
      setCustomCode("");
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
    <div className="w-full space-y-4">
       <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 max-w-xl mx-auto w-full">
         <div className="flex flex-col sm:flex-row">
           <Input
             type="url"
             value={url}
             onChange={(e) => setUrl(e.target.value)}
             placeholder="Paste your long URL here..."
             className="flex-1 bg-background/50 backdrop-blur-sm transform-gpu h-12 sm:h-14 px-6 text-sm font-mono border-border/60 rounded-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-border/60 shadow-none transition-all"
             required
             disabled={isLoading}
           />
           <Button
             type="submit"
             disabled={isLoading || !url}
             className="h-12 sm:h-14 w-full sm:w-auto px-8 uppercase font-mono font-bold tracking-widest text-[11px] rounded-none bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all shadow-none"
           >
             {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Shorten"}
             {!isLoading && <span className="ml-2">→</span>}
           </Button>
         </div>
         <Input
           type="text"
           value={customCode}
           onChange={(e) => setCustomCode(e.target.value)}
           placeholder="Custom short code (optional, e.g. summer-sale)"
           className="h-10 px-4 text-sm font-mono bg-background/50 backdrop-blur-sm border-border/60 rounded-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-border/60 shadow-none transition-all"
           maxLength={30}
           disabled={isLoading}
         />
       </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center justify-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3 p-6 bg-background/80 border border-border/70 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Your shortened URL is ready!</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-medium text-foreground hover:underline"
            >
              {result.shortUrl}
            </a>
            <Button
              onClick={copyToClipboard}
              variant={copied ? "default" : "outline"}
              className="uppercase font-semibold text-xs tracking-wider h-10 px-4"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
