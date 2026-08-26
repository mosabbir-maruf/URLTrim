"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Edit2, LogOut, Users, Link as LinkIcon } from "lucide-react";

type User = { id: string; email: string; role: string; created_at: number };
type Link = { id: string; code: string; original_url: string; email: string; clicks: number; created_at: number };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"links" | "users">("links");
  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linksRes, usersRes] = await Promise.all([
        fetch("/api/admin/links"),
        fetch("/api/admin/users")
      ]);

      if (linksRes.status === 401 || usersRes.status === 401) {
        router.push("/login");
        return;
      }

      const linksData = await linksRes.json();
      const usersData = await usersRes.json();

      if (linksData.success) setLinks(linksData.links);
      if (usersData.success) setUsers(usersData.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure? This will delete the user and ALL their links permanently.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
      else alert("Failed to delete user. Cannot delete yourself.");
    } catch (err) { console.error(err); }
  };

  const handleDeleteLink = async (code: string) => {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await fetch(`/api/admin/links?code=${code}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEditLink = async (code: string, currentUrl: string) => {
    const newUrl = prompt("Enter new URL:", currentUrl);
    if (!newUrl || newUrl === currentUrl) return;
    try {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, original_url: newUrl }),
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-xl w-fit">
          <button onClick={() => setActiveTab("links")} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === "links" ? "bg-white dark:bg-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}><LinkIcon className="w-4 h-4" /> All Links</button>
          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeTab === "users" ? "bg-white dark:bg-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}><Users className="w-4 h-4" /> Users</button>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {activeTab === "links" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500">
                    <th className="p-4">Code</th>
                    <th className="p-4">Original URL</th>
                    <th className="p-4">Creator</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 font-medium text-neutral-900 dark:text-white">{link.code}</td>
                      <td className="p-4 text-neutral-500 max-w-xs truncate">{link.original_url}</td>
                      <td className="p-4 text-neutral-500 text-sm">{link.email || <span className="italic">Anonymous</span>}</td>
                      <td className="p-4 text-neutral-900 dark:text-white font-medium">{link.clicks}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditLink(link.code, link.original_url)} className="p-2 text-neutral-400 hover:text-blue-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteLink(link.code)} className="p-2 text-neutral-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500">
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 font-medium text-neutral-900 dark:text-white">{user.email}</td>
                      <td className="p-4"><span className={`px-2.5 py-1 text-xs rounded-full font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"}`}>{user.role}</span></td>
                      <td className="p-4 text-neutral-500 text-sm">{new Date(user.created_at * 1000).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteUser(user.id)} disabled={user.role === "admin"} className="p-2 text-neutral-400 hover:text-red-600 rounded-lg disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
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
