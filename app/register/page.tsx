"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFooter as Footer } from "@/components/admin-chrome";
import { Logo } from "@/components/ui/logo";
import { EMAIL_REGEX } from "@/lib/validation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMsg(data.message || "Registration complete! You can now log in.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 mx-auto w-full max-w-6xl border-x bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
        <nav className="flex h-14 items-center justify-between px-2 md:h-12">
            <Link href="/" className="-ml-2 flex h-10 items-center justify-center gap-1.5 px-4 transition-colors hover:bg-muted font-bold tracking-tight">
              <Logo className="w-6 h-6" />
              <span className="text-lg mt-0.5">urltrim</span>
            </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Home
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Log in
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col border-t relative">
        <div className="mx-auto flex w-full max-w-6xl flex-col border-x relative items-center justify-center min-h-[calc(100vh-6rem)] py-12 px-4 md:px-8">
          
          <div className="relative flex w-full flex-col items-center justify-between border border-border/70 overflow-hidden min-h-[750px] py-16 bg-background">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-y-0 left-1/2 h-full w-[1200px] -translate-x-1/2">
                <svg
                  className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(black,transparent),radial-gradient(black,transparent)] [mask-composite:intersect] text-black/[16.5%] dark:text-white/[16.5%]"
                  width="100%"
                  height="100%"
                >
                  <defs>
                    <pattern id="grid-pattern" x="-1" y="-1" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="transparent" stroke="currentColor" strokeWidth="1"></path>
                    </pattern>
                  </defs>
                  <rect fill="url(#grid-pattern)" width="100%" height="100%"></rect>
                </svg>
              </div>
            </div>

            <div className="relative mt-8 flex w-full flex-col items-center justify-center px-4 z-10" style={{ opacity: 1 }}>
              <div className="w-full max-w-sm">
                <h3 className="text-center text-xl font-semibold">
                  {successMsg ? "You're all set" : "Create your account"}
                </h3>

                <div className="mt-8">
                  <div className="flex flex-col gap-3">
                    <div className="overflow-hidden" style={{ width: "auto" }}>
                      <div className="h-max">
                        <div className="flex flex-col gap-3 p-1">
                          <div className="flex flex-col gap-3">
                            {error && (
                              <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md text-center border border-destructive/20">
                                {error}
                              </div>
                            )}
                            {successMsg ? (
                              <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                <div>
                                  <h4 className="text-lg font-semibold">Registration complete</h4>
                                  <p className="mt-1 text-sm text-muted-foreground">{successMsg}</p>
                                </div>
                                <Link href="/login" className={buttonVariants({ size: "sm" })}>
                                  Continue to login
                                </Link>
                              </div>
                            ) : (
                              <>
                                <form className="flex flex-col gap-y-4" onSubmit={handleRegister} noValidate>
                                  <div>
                                    <Input
                                      placeholder="you@example.com"
                                      type="email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="mt-2 bg-background/50 backdrop-blur-sm"
                                      required
                                    />
                                    <Input
                                      placeholder="Password (min 8 characters)"
                                      type="password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      minLength={8}
                                      className="mt-4 bg-background/50 backdrop-blur-sm"
                                      required
                                    />
                                  </div>
                                  <Button type="submit" disabled={loading} className="mt-2 uppercase font-semibold">
                                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sign Up"}
                                  </Button>
                                </form>
                                <div className="my-3 flex flex-shrink items-center justify-center gap-2">
                                  <div className="grow basis-0 border-b"></div>
                                  <span className="text-muted-foreground text-xs leading-none font-medium uppercase">
                                    or
                                  </span>
                                  <div className="grow basis-0 border-b"></div>
                                </div>
                              </>
                            )}
                          </div>

                          {!successMsg && (
                            <div className="mt-2">
                              <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full uppercase font-semibold bg-background/50 backdrop-blur-sm" })}>
                                Log in instead
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
