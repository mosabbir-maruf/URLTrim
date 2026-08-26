"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Edit2, LogOut, Copy, ExternalLink } from "lucide-react";

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

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to permanently delete this link?")) return;
    try {
      const res = await fetch(`/api/user/links?code=${code}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter(l => l.code !== code));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (code: string, currentUrl: string) => {
    const newUrl = prompt("Enter new original URL:", currentUrl);
    if (!newUrl || newUrl === currentUrl) return;

    try {
      const res = await fetch("/api/user/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, original_url: newUrl }),
      });
      if (res.ok) {
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Your Dashboard</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push("/")} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-sm font-medium">Create New Link</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {links.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">You haven't created any links yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500">
                    <th className="p-4">Short Code</th>
                    <th className="p-4">Original URL</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                        {link.code}
                        <button onClick={() => navigator.clipboard.writeText(`https://shrtn.pages.dev/${link.code}`)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><Copy className="w-4 h-4" /></button>
                      </td>
                      <td className="p-4 text-neutral-500 max-w-xs truncate" title={link.original_url}>
                        <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          {link.original_url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4 text-neutral-900 dark:text-white font-medium">{link.clicks}</td>
                      <td className="p-4 text-neutral-500 text-sm">{new Date(link.created_at * 1000).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEdit(link.code, link.original_url)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(link.code)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
