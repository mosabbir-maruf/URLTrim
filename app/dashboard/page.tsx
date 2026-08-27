"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Trash2,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  BarChart2,
  Plus,
  CheckCircle2,
  LayoutDashboard,
  Pencil,
  Users as UsersIcon,
  ArrowLeft,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFooter as Footer } from "@/components/admin-chrome";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

type LinkRow = {
  id: string;
  code: string;
  original_url: string;
  clicks: number;
  created_at: number;
  is_active: number;
  email?: string;
};

type UserRow = {
  id: string;
  email: string;
  role: string;
  created_at: number;
};

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newCode, setNewCode] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"overview" | "links" | "users">("overview");
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [pendingBulkDeleteLinks, setPendingBulkDeleteLinks] = useState(false);
  const [pendingBulkDeleteUsers, setPendingBulkDeleteUsers] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<string | null>(null);
  const [editing, setEditing] = useState<LinkRow | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [me, setMe] = useState<{ id: string; email: string; role: string } | null>(null);
  const [overview, setOverview] = useState<{
    totalLinks: number;
    userLinks: number;
    userClicks: number;
  } | null>(null);
  const [viewUser, setViewUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();

  const isAdmin = me?.role === "admin";

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) setMe(data.user);
        else router.push("/login");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!me) return;
    fetchLinks();
    if (isAdmin) {
      fetchUsers();
      fetchOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  async function fetchLinks(userId?: string) {
    try {
      const endpoint = isAdmin
        ? `/api/admin/links${userId ? `?user_id=${userId}` : ""}`
        : "/api/user/links";
      const res = await fetch(endpoint, { credentials: "include", cache: "no-store" });
      if (res.status === 401) {
        router.push("/login");
        return; // Early return prevents setIsLoading(false) and stops the flash
      }
      const data = await res.json();
      if (data.success) setLinks(data.links);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  async function fetchOverview() {
    try {
      const res = await fetch("/api/admin/overview", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setOverview(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const openUserLinks = (u: UserRow) => {
    setViewUser({ id: u.id, email: u.email });
    fetchLinks(u.id);
  };

  const closeUserLinks = () => {
    setViewUser(null);
    fetchLinks();
  };

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setCreateError(null);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, ...(newCode.trim() ? { customCode: newCode.trim() } : {}) }),
        credentials: "include",
      });
      if (res.ok) {
        setNewUrl("");
        setNewCode("");
        setIsCreating(false);
        fetchLinks();
      } else {
        const data = await res.json();
        setCreateError(data.error || "Failed to create link");
      }
    } catch (err) {
      console.error(err);
      setCreateError("Failed to create link");
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedLinks.length === 0) return;
    
    const endpoint = isAdmin ? "/api/admin/links" : "/api/user/links";
      
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: selectedLinks })
      });
      if (res.ok) {
        setLinks(links.filter((l) => !selectedLinks.includes(l.code)));
        setSelectedLinks([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingBulkDeleteLinks(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const endpoint = isAdmin
      ? `/api/admin/links?code=${pendingDelete}`
      : `/api/user/links?code=${pendingDelete}`;
    try {
      const res = await fetch(endpoint, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setLinks(links.filter((l) => l.code !== pendingDelete));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDelete(null);
    }
  };

  const confirmBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    if (selectedUsers.includes(me?.id as string)) {
      alert("You cannot delete yourself.");
      return;
    }
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUsers })
      });
      if (res.ok) {
        setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to delete users");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingBulkDeleteUsers(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!pendingDeleteUser) return;
    try {
      const res = await fetch(`/api/admin/users?id=${pendingDeleteUser}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== pendingDeleteUser));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDeleteUser(null);
    }
  };

  const openEdit = (link: LinkRow) => {
    setEditing(link);
    setEditUrl(link.original_url);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editing.code, original_url: editUrl }),
        credentials: "include",
      });
      if (res.ok) {
        setLinks(
          links.map((l) => (l.code === editing.code ? { ...l, original_url: editUrl } : l))
        );
        setEditing(null);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to update link");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalClicks = useMemo(() => links.reduce((sum, link) => sum + link.clicks, 0), [links]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderLinksTable = (showOwner: boolean) => (
    <div className="flex flex-col">
      {selectedLinks.length > 0 && (
        <div className="bg-muted/10 border-b px-6 py-3 flex items-center justify-between min-h-[52px]">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">{selectedLinks.length} selected</span>
          {pendingBulkDeleteLinks ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-muted-foreground mr-2 hidden sm:inline">ARE YOU SURE?</span>
              <button
                onClick={() => setPendingBulkDeleteLinks(false)}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="text-xs font-bold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 px-3 py-2 border border-destructive/20 rounded bg-background"
              >
                Confirm Delete
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setPendingBulkDeleteLinks(true)}
              className="text-xs font-bold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 px-3 py-2 border border-destructive/20 rounded bg-background"
            >
              Delete Selected
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b bg-muted/10 text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-foreground/20 bg-background accent-foreground w-4 h-4 cursor-pointer"
                  checked={links.length > 0 && selectedLinks.length === links.length}
                  onChange={(e) => setSelectedLinks(e.target.checked ? links.map(l => l.code) : [])}
                  title="Select All"
                />
              </th>
              <th className="px-6 py-4">Short Link</th>
              <th className="px-6 py-4">Destination</th>
              {showOwner && <th className="px-6 py-4">Owner</th>}
              <th className="px-6 py-4">Clicks</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-muted/10 transition-colors group">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-foreground/20 bg-background accent-foreground w-4 h-4 cursor-pointer"
                    checked={selectedLinks.includes(link.code)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedLinks([...selectedLinks, link.code]);
                      else setSelectedLinks(selectedLinks.filter(c => c !== link.code));
                    }}
                  />
                </td>
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
              {showOwner && (
                <td className="px-6 py-4 text-sm text-muted-foreground">{link.email || "—"}</td>
              )}
              <td className="px-6 py-4 font-mono text-sm">{link.clicks}</td>
              <td className="px-6 py-4 text-right">
                {pendingDelete === link.code ? (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="text-xs font-bold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                    {isAdmin && (
                      <button onClick={() => openEdit(link)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setPendingDelete(link.code)} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {links.length === 0 && (
            <tr>
              <td colSpan={showOwner ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground text-sm uppercase tracking-widest font-bold">No links found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );

  return (
    <div className="flex min-h-svh flex-col bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] rounded-full bg-foreground/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 mx-auto w-full max-w-6xl border-x bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
        <nav className="flex h-14 items-center justify-between px-2 md:h-12">
          <Link href="/" className="-ml-2 flex h-10 items-center justify-center gap-1.5 px-4 transition-colors hover:bg-muted font-bold tracking-tight">
            <Logo className="w-6 h-6" />
            <span className="text-lg mt-0.5">URLTrim</span>
          </Link>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <span className="hidden sm:inline-block mr-1 border border-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                Admin
              </span>
            )}
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
                onClick={() => { setCurrentTab("overview"); closeUserLinks(); }}
                className={cn(
                  "flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap relative",
                  currentTab === "overview"
                    ? "border-foreground text-foreground bg-background/50"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" /> Overview
              </button>
              <button
                onClick={() => { setCurrentTab("links"); closeUserLinks(); }}
                className={cn(
                  "flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap relative",
                  currentTab === "links"
                    ? "border-foreground text-foreground bg-background/50"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" /> {isAdmin ? "All Links" : "Links"}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setCurrentTab("users")}
                  className={cn(
                    "flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap relative",
                    currentTab === "users"
                      ? "border-foreground text-foreground bg-background/50"
                      : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" /> Users
                </button>
              )}
            </div>
            {currentTab === "links" && (
              <div className="pr-2 sm:pr-4 shrink-0">
                <Button onClick={() => setIsCreating(!isCreating)} className="uppercase font-bold tracking-wider text-[10px] sm:text-xs h-9 sm:h-10 px-3 sm:px-4">
                  <Plus className="w-3 h-3 mr-1" /> New Link
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-16 overflow-y-auto min-h-[70vh]">
            {currentTab === "overview" && (
              <>
                {isAdmin ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-6 bg-background/50">
                      <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                        <Logo className="w-4 h-4" /> Admin Links
                      </div>
                      <div className="text-5xl font-light tracking-tight">{links.length}</div>
                    </div>
                    <div className="border p-6 bg-background/50">
                      <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                        <LinkIcon className="w-4 h-4" /> Total Links
                      </div>
                      <div className="text-5xl font-light tracking-tight">{overview?.totalLinks ?? 0}</div>
                    </div>
                    <div className="border p-6 bg-background/50">
                      <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                        <UsersIcon className="w-4 h-4" /> All User Links
                      </div>
                      <div className="text-5xl font-light tracking-tight">{overview?.userLinks ?? 0}</div>
                    </div>
                    <div className="border p-6 bg-background/50">
                      <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                        <BarChart2 className="w-4 h-4" /> All User Clicks
                      </div>
                      <div className="text-5xl font-light tracking-tight">{overview?.userClicks ?? 0}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-6 bg-background/50">
                      <div className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">
                        <Logo className="w-4 h-4" /> Your Links
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
              </>
            )}

            {currentTab === "links" && (
              <div className="border bg-background/50 overflow-hidden">
                {isCreating && (
                  <div className="mb-8 border p-6 bg-background shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Create New Link</h3>
                    <form onSubmit={handleCreateLink} noValidate className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          type="url"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://example.com"
                          required
                          autoFocus
                        />
                        {showCustom && (
                          <Input
                            type="text"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="Custom code (optional)"
                            maxLength={30}
                            autoFocus
                          />
                        )}
                        <Button type="submit" className="uppercase font-semibold">Shorten</Button>
                        <Button type="button" variant="outline" onClick={() => { setIsCreating(false); setNewCode(""); setShowCustom(false); setCreateError(null); }} className="uppercase font-semibold">Cancel</Button>
                      </div>
                      {showCustom ? (
                        <button
                          type="button"
                          onClick={() => { setShowCustom(false); setNewCode(""); }}
                          className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Use random code instead
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustom(true)}
                          className="self-start inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" /> Custom short code
                        </button>
                      )}
                      {createError && (
                        <p className="text-sm text-destructive">{createError}</p>
                      )}
                    </form>
                  </div>
                )}

                {renderLinksTable(isAdmin)}
              </div>
            )}

            {currentTab === "users" && isAdmin && (
              viewUser ? (
                <div className="border bg-background/50 overflow-hidden">
                  <div className="flex items-center justify-between border-b bg-muted/10 px-4 py-3">
                    <button
                      onClick={closeUserLinks}
                      className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/30 px-3 py-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to users
                    </button>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      <UsersIcon className="w-4 h-4" /> {viewUser.email}&apos;s Links
                    </div>
                  </div>
                  {renderLinksTable(false)}
                </div>
              ) : (
                <div className="border bg-background/50 overflow-hidden flex flex-col">
                  {selectedUsers.length > 0 && (
                    <div className="bg-muted/10 border-b px-6 py-3 flex items-center justify-between min-h-[52px]">
                      <span className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">{selectedUsers.length} selected</span>
                      {pendingBulkDeleteUsers ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono tracking-widest text-muted-foreground mr-2 hidden sm:inline">ARE YOU SURE?</span>
                          <button
                            onClick={() => setPendingBulkDeleteUsers(false)}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground px-3 py-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmBulkDeleteUsers}
                            className="text-xs font-bold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 px-3 py-2 border border-destructive/20 rounded bg-background"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setPendingBulkDeleteUsers(true)}
                          className="text-xs font-bold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 px-3 py-2 border border-destructive/20 rounded bg-background"
                        >
                          Delete Selected
                        </button>
                      )}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b bg-muted/10 text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">
                          <th className="px-6 py-4 w-12">
                            <input 
                              type="checkbox" 
                              className="rounded border-foreground/20 bg-background accent-foreground w-4 h-4 cursor-pointer"
                              checked={users.length > 0 && selectedUsers.length === users.length}
                              onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u.id) : [])}
                              title="Select All"
                            />
                          </th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-foreground/20 bg-background accent-foreground w-4 h-4 cursor-pointer"
                                checked={selectedUsers.includes(u.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                  else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => openUserLinks(u)}
                                className="flex items-center gap-2 text-left transition-colors hover:text-foreground text-foreground"
                              >
                                {u.email}
                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all" />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground">{u.role}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(u.created_at * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {pendingDeleteUser === u.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setPendingDeleteUser(null)}
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground px-2 py-1"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={confirmDeleteUser}
                                    className="text-xs font-bold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10 px-2 py-1"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setPendingDeleteUser(u.id)}
                                  disabled={u.id === me?.id}
                                  className={cn(
                                    "p-2 transition-colors",
                                    u.id === me?.id
                                      ? "text-muted-foreground/40 cursor-not-allowed"
                                      : "text-muted-foreground hover:text-destructive"
                                  )}
                                  title={u.id === me?.id ? "Cannot delete yourself" : "Delete user"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm uppercase tracking-widest font-bold">No users found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <div className="z-10 mt-auto">
        <Footer />
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm border border-foreground bg-background">
            <div className="border-b border-foreground px-5 py-4">
              <h2 className="text-sm font-bold uppercase tracking-widest">Edit link</h2>
            </div>
            <div className="px-5 py-6 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Code</div>
                <div className="font-mono text-sm">{editing.code}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Destination URL</div>
                <Input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex border-t border-foreground">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border-r border-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
