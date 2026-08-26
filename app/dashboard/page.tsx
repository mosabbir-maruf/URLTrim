"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2, LogOut, Copy, ExternalLink, Link as LinkIcon, BarChart2, Plus, CheckCircle2, LayoutDashboard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFooter as Footer } from "@/components/admin-chrome";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

type Link = {
  id: string;
  code: string;
  original_url: string;
  clicks: number;
  created_at: number;
  is_active: number;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"overview" | "links">("overview");
  const router = useRouter();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/user/links");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      if (res.ok) {
        setNewUrl("");
        setIsCreating(false);
        fetchLinks();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create link");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Permanently delete this link?")) return;
    try {
      const res = await fetch(`/api/user/links?code=${code}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter(l => l.code !== code));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`https://urltrim.pages.dev/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  return (
    <div className="flex min-h-svh flex-col bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] rounded-full bg-foreground/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 mx-auto w-full max-w-6xl border-x bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
        <nav className="flex h-14 items-center justify-between px-2 md:h-12">
          <Link href="/" className="-ml-2 flex h-10 items-center justify-center gap-1.5 px-4 transition-colors hover:bg-muted font-bold tracking-tight">
            <Logo className="w-6 h-6" />
            <span className="text-lg mt-0.5">urltrim</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={handleLogout} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Sign out
            </button>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col border-t relative z-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col flex-1 border-x relative bg-background/50 backdrop-blur-sm">
          
          <div className="flex items-center justify-between border-b bg-muted/10 overflow-x-auto px-2">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentTab("overview")}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-mono font-bold tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap relative",
                  currentTab === "overview"
                    ? "border-foreground text-foreground bg-background/50"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" /> Overview
              </button>
              <button
                onClick={() => setCurrentTab("links")}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-mono font-bold tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap relative",
                  currentTab === "links"
                    ? "border-foreground text-foreground bg-background/50"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <LinkIcon className="h-4 w-4" /> Links
              </button>
            </div>
            {currentTab === "links" && (
              <div className="pr-4">
                <Button onClick={() => setIsCreating(!isCreating)} className="uppercase font-bold tracking-wider">
                  <Plus className="w-3 h-3 mr-1" /> New Link
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-16 overflow-y-auto min-h-[70vh]">
            
            {isCreating && currentTab === "links" && (
              <div className="mb-8 border p-6 bg-background shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Create New Link</h3>
                <form onSubmit={handleCreateLink} className="flex gap-4">
                  <Input 
                    type="url" 
                    value={newUrl} 
                    onChange={e => setNewUrl(e.target.value)} 
                    placeholder="https://example.com" 
                    required 
                    autoFocus
                  />
                  <Button type="submit" className="uppercase font-semibold">Shorten</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="uppercase font-semibold">Cancel</Button>
                </form>
              </div>
            )}

            {currentTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-6 bg-background/50">
                  <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                    <Logo className="w-4 h-4" /> Total Links
                  </div>
                  <div className="text-5xl font-light tracking-tight">{links.length}</div>
                </div>
                <div className="border p-6 bg-background/50">
                  <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                    <BarChart2 className="w-4 h-4" /> Total Clicks
                  </div>
                  <div className="text-5xl font-light tracking-tight">{totalClicks}</div>
                </div>
              </div>
            )}
            
            {currentTab === "links" && (
              <div className="border bg-background/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b bg-muted/10 text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">
                        <th className="px-6 py-4">Short Link</th>
                        <th className="px-6 py-4">Destination</th>
                        <th className="px-6 py-4">Clicks</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {links.map((link) => (
                        <tr key={link.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm">{link.code}</span>
                              <button onClick={() => copyToClipboard(link.code)} className="text-muted-foreground hover:text-foreground transition-colors">
                                {copiedCode === link.code ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate max-w-xs transition-colors">
                              {link.original_url} <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm">{link.clicks}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDelete(link.code)} className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {links.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-sm uppercase tracking-widest font-bold">No links found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
