"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { ArrowUp, Moon, Sun } from "lucide-react"
import { SocialIcon } from "./ui/icons"


export function ThemeControls() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center border">
        <button type="button" className="p-2 disabled:bg-foreground disabled:text-background" disabled><Sun className="h-4 w-4" /></button>
        <button type="button" className="border-x p-2"><ArrowUp className="h-4 w-4" /></button>
        <button type="button" className="p-2 disabled:bg-foreground disabled:text-background" disabled><Moon className="h-4 w-4" /></button>
      </div>
    )
  }

  return (
    <div className="flex items-center border">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className="p-2 transition-colors hover:bg-muted disabled:bg-foreground disabled:text-background"
        disabled={theme === "light"}
        aria-label="Use light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="border-x p-2 transition-colors hover:bg-muted"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className="p-2 transition-colors hover:bg-muted disabled:bg-foreground disabled:text-background"
        disabled={theme === "dark"}
        aria-label="Use dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  )
}

export function AdminFooter() {
  return (
    <footer className="border-t border-b mb-8">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 py-6 sm:py-3 sm:flex-row border-x px-4">
        <div className="flex-1 flex flex-wrap justify-center sm:justify-start items-center gap-4">
          <SocialLink label="X" href="https://x.com/hellomosabbir" icon="x" />
          <SocialLink
            label="Instagram"
            href="https://www.instagram.com/mosabbir_maruf"
            icon="instagram"
          />
          <SocialLink
            label="LinkedIn"
            href="https://www.linkedin.com/in/mosabbir-maruf/"
            icon="linkedin"
          />
          <SocialLink
            label="Github"
            href="https://github.com/mosabbir-maruf"
            icon="github"
          />
          <SocialLink
            label="Facebook"
            href="https://facebook.com/mosabbirmaruf"
            icon="facebook"
          />
        </div>
        
        <p className="flex flex-1 items-center justify-center text-center gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
          A sideproject by <a href="https://mosabbir.pages.dev" target="_blank" rel="noreferrer" className="text-foreground font-semibold hover:underline transition-all block sm:inline">Mosabbir Maruf</a>
        </p>

        <div className="flex flex-1 items-center justify-center sm:justify-end gap-6">
          <ThemeControls />
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  label,
  href,
  icon,
}: {
  label: string
  href: string
  icon: "github" | "facebook" | "instagram" | "x" | "linkedin"
}) {
  return (
    <Link
      aria-label={label}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="transition-transform hover:scale-110"
    >
      <SocialIcon type={icon} />
    </Link>
  )
}
