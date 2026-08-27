"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HeaderAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(data.authenticated);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted/50" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>Log in</Link>
        <Link href="/register" className={buttonVariants({ size: "sm" })}>Register</Link>
      </div>
      <div className="sm:hidden flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ size: "sm" })}>Log in</Link>
      </div>
    </div>
  );
}
