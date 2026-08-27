"use client";

import { useState } from "react";
import { Copy, CheckCircle2, AlertCircle, LoaderCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [showCustom, setShowCustom] = useState(false);

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
       <form onSubmit={handleSubmit} noValidate className="flex flex-col max-w-xl mx-auto w-full">
         <div className="flex flex-col sm:flex-row border border-border/60 focus-within:ring-1 focus-within:ring-ring focus-within:border-border/60 transition-all bg-background/50 backdrop-blur-sm">
           {/* Inputs Container */}
           <div className="flex flex-col flex-1">
             <Input
               type="url"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               placeholder="Paste your long URL here..."
               className="h-14 sm:h-16 px-6 text-sm font-mono border-0 focus-visible:ring-0 shadow-none rounded-none bg-transparent"
               required
               disabled={isLoading}
             />
             
             {showCustom ? (
               <div className="flex items-center px-6 h-12 bg-muted/20 border-t border-border/60 animate-in fade-in slide-in-from-top-1">
                 <span className="font-mono text-sm text-muted-foreground select-none">/</span>
                 <Input
                   type="text"
                   value={customCode}
                   onChange={(e) => setCustomCode(e.target.value)}
                   placeholder="custom-alias (e.g. my-link)"
                   className="flex-1 h-full px-3 text-sm font-mono border-0 focus-visible:ring-0 shadow-none rounded-none bg-transparent"
                   maxLength={30}
                   disabled={isLoading}
                   autoFocus
                 />
                 <button
                   type="button"
                   onClick={() => setCustomCode(Math.random().toString(36).substring(2, 8))}
                   className="shrink-0 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors ml-2"
                 >
                   random
                 </button>
                 <button
                   type="button"
                   onClick={() => { setShowCustom(false); setCustomCode(""); }}
                   className="shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-4 p-1"
                   aria-label="Close custom alias"
                 >
                   <X className="w-3.5 h-3.5" />
                 </button>
               </div>
             ) : (
               <div className="flex items-center px-6 h-10 border-t border-border/60 bg-transparent hover:bg-muted/10 transition-colors">
                 <button
                   type="button"
                   onClick={() => setShowCustom(true)}
                   className="w-full h-full text-left inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                 >
                   <Plus className="h-3.5 w-3.5" /> Custom short code
                 </button>
               </div>
             )}
           </div>

           {/* Submit Button */}
           <Button
             type="submit"
             disabled={isLoading || !url}
             className="h-14 sm:h-auto w-full sm:w-36 uppercase font-mono font-bold tracking-widest text-[11px] rounded-none bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all shadow-none border-t sm:border-t-0 sm:border-l border-border/60"
           >
             {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : "Shorten"}
             {!isLoading && <Logo className="w-3.5 h-3.5 -ml-1" />}
           </Button>
         </div>
       </form>

      {error && (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center justify-center max-w-xl mx-auto w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="break-words">{error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3 p-6 bg-background/80 border border-border/70 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Your shortened URL is ready!</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 bg-muted/20 p-4 border border-border/50">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg font-mono font-medium text-foreground hover:underline truncate w-full text-center sm:text-left"
            >
              {result.shortUrl}
            </a>
            <Button
              onClick={copyToClipboard}
              variant={copied ? "default" : "outline"}
              className="uppercase font-semibold text-xs tracking-wider h-10 px-4 shrink-0 w-full sm:w-auto"
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
