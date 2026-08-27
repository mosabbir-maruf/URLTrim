import Link from "next/link"
import { Globe } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Marquee } from "@/components/ui/marquee"
import { AdminFooter } from "@/components/admin-chrome";
import { SocialIcon } from "@/components/ui/icons";
import { UrlForm } from "@/components/url-form";
import { Logo } from "@/components/ui/logo";
import { HeaderAuth } from "@/components/header-auth";

export default function AdminPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 mx-auto w-full max-w-6xl border-x bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
        <nav className="flex h-14 items-center justify-between px-2 md:h-12">
          <Link href="/" className="-ml-2 flex h-10 items-center justify-center gap-1.5 px-4 transition-colors hover:bg-muted font-bold tracking-tight">
            <Logo className="w-6 h-6" />
            <span className="text-lg mt-0.5">URLTrim</span>
          </Link>
          <HeaderAuth />
        </nav>
      </header>
      
      <main className="flex flex-1 flex-col border-t relative">
        <div className="mx-auto flex w-full max-w-6xl flex-col border-x relative">
          <section className="flex flex-col items-center justify-center px-5 pt-20 pb-16 relative overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-50 overflow-hidden">
              <div className="h-[25rem] w-[25rem] rounded-full bg-muted/50 blur-3xl transform-gpu" />
            </div>
            
            <h1 className="max-w-3xl text-center font-mono text-[9vw] sm:text-6xl md:text-[5rem] font-bold leading-[1.05] tracking-tight z-10">
              <span className="text-foreground">SHORT LINKS.</span>
              <br />
              <span className="text-muted-foreground/60">MADE SIMPLE.</span>
            </h1>
            
            <p className="mt-6 max-w-lg text-center font-mono text-sm leading-7 text-muted-foreground/70 z-10 px-4 sm:px-0">
              Create fast, shareable short URLs in seconds. Built
              <br className="hidden sm:block" />
              on Edge infrastructure for global low-latency
              <br className="hidden sm:block" />
              redirects.
            </p>

            <div className="w-full max-w-2xl mx-auto mt-10 relative z-10">
              <UrlForm />
            </div>
          </section>

          <SystemStatusTicker />
          
          <section className="grid border-b sm:grid-cols-3">
            <Feature
              number="001"
              title="Edge Network"
              description="Global CDN resolution with milliseconds latency."
            />
            <Feature
              number="002"
              title="Authentication"
              description="Secure JWT payload verification natively on the Edge."
            />
            <Feature
              number="003"
              title="D1 Database"
              description="Serverless SQL capabilities for high-performance indexing."
            />
          </section>

          <HowItWorksSection />
          <LimitsSection />
          <ChangelogSection />

          <section className="flex flex-col items-center justify-center px-5 py-24">
            <div className="text-center mb-12">
              <h2 className="font-mono text-3xl font-bold tracking-tighter uppercase sm:text-4xl">
                Connect
              </h2>
              <p className="mt-4 text-xs font-mono tracking-wide text-muted-foreground">
                Stay connected and follow my work across all platforms.
              </p>
            </div>

            <div className="w-full max-w-4xl border overflow-hidden">
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x border-border/40">
                <div className="flex flex-col divide-y border-border/40 *:border-dashed">
                  <SocialCard
                    icon={<SocialIcon type="github" />}
                    title="Github"
                    description="Explore my open-source projects and code..."
                    href="https://github.com/mosabbir-maruf"
                  />
                  <SocialCard
                    icon={<SocialIcon type="instagram" />}
                    title="Instagram"
                    description="Visual stories, behind-the-scenes, and..."
                    href="https://www.instagram.com/mosabbir_maruf"
                  />
                  <SocialCard
                    icon={<SocialIcon type="x" />}
                    title="X (Twitter)"
                    description="Follow me for design insights, tech updates..."
                    href="https://x.com/hellomosabbir"
                  />
                </div>
                <div className="flex flex-col divide-y border-border/40 *:border-dashed">
                  <SocialCard
                    icon={<SocialIcon type="facebook" />}
                    title="Facebook"
                    description="Join the community and see latest updates..."
                    href="https://www.facebook.com/mosabbir.maruf/"
                  />
                  <SocialCard
                    icon={<SocialIcon type="linkedin" />}
                    title="LinkedIn"
                    description="Connect with me professionally and explore..."
                    href="https://www.linkedin.com/in/mosabbir-maruf/"
                  />
                  <SocialCard
                    icon={<Globe className="h-5 w-5" />}
                    title="Portfolio"
                    description="View my complete body of work and projects..."
                    href="https://mosabbir.pages.dev"
                  />
                </div>

              </div>
            </div>

            <div className="mt-12 text-center max-w-lg">
              <p className="font-mono text-xs text-muted-foreground leading-5">
                For partnerships, collaborations, sponsorships, commissions, 
                events, you can reach out to me at{" "}
                <a 
                  href="mailto:hellomosabbir@outlook.com" 
                  className="font-bold text-foreground hover:underline"
                >
                  hellomosabbir@outlook.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <AdminFooter />
    </div>
  )
}

function SystemStatusTicker() {
  return (
    <section className="overflow-hidden border-y border-border/40">
      <div className="relative">
        

        <div className="flex flex-col items-center md:flex-row">
          <div className="relative w-full py-4">
            <div>
              <Marquee className="flex items-center py-2" speed="slow" >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center mx-4 gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                    {i % 2 === 0 && (
                      <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                    )}
                    <span>All Systems Operational</span>
                    <span className="text-muted-foreground/30 font-light">/</span>
                    <span>End-to-End Encrypted</span>
                    <span className="text-muted-foreground/30 font-light">/</span>
                    <span>Millisecond Latency</span>
                    <span className="text-muted-foreground/30 font-light">/</span>
                    <span>Edge Sync Active</span>
                    <span className="text-muted-foreground/30 font-light">/</span>
                  </div>
                ))}
              </Marquee>
            </div>
            <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-linear-to-r" />
            <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-linear-to-l" />
          </div>
        </div>
      </div>
    </section>
  )
}


function HowItWorksSection() {
  return (
    <section className="flex flex-col items-center justify-center px-5 py-24 border-b border-border/40">
      <div className="text-center mb-16">
        <h2 className="font-mono text-3xl font-bold tracking-tighter uppercase sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-xs font-mono tracking-wide text-muted-foreground">
          The anatomy of an edge-resolved short link.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-3 gap-4 md:gap-0 relative">
          
          <div className="border border-border/40 bg-card/10 p-8 relative z-10 group hover:border-foreground/50 hover:bg-card/20 transition-colors">
            <div className="text-5xl font-mono font-black text-muted-foreground/10 mb-6 group-hover:text-foreground/20 transition-colors">01</div>
            <h3 className="font-mono text-lg font-bold uppercase mb-3">Ingestion</h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              You submit a long URL. Our API validates the payload and securely generates a unique cryptographic short hash.
            </p>
          </div>

          <div className="border border-border/40 bg-card/10 p-8 relative z-10 md:-ml-px md:mt-8 group hover:border-foreground/50 hover:bg-card/20 transition-colors">
            <div className="text-5xl font-mono font-black text-muted-foreground/10 mb-6 group-hover:text-foreground/20 transition-colors">02</div>
            <h3 className="font-mono text-lg font-bold uppercase mb-3">Distribution</h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              The hash and destination are committed to Cloudflare D1, a serverless SQL database distributed instantly to edge nodes worldwide.
            </p>
          </div>

          <div className="border border-border/40 bg-card/10 p-8 relative z-10 md:-ml-px md:mt-16 group hover:border-foreground/50 hover:bg-card/20 transition-colors">
            <div className="text-5xl font-mono font-black text-muted-foreground/10 mb-6 group-hover:text-foreground/20 transition-colors">03</div>
            <h3 className="font-mono text-lg font-bold uppercase mb-3">Resolution</h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              When a user clicks, the nearest Edge server intercepts the request, logs the analytics, and redirects in milliseconds.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  )
}

function ChangelogSection() {
  const logs = [
    { version: "v1.8.0", date: "Aug 26, 2026", text: "Complete decoupling and native Cloudflare Edge integration." },
    { version: "v1.4.0", date: "Last week", text: "Introduced user dashboards, JWT authentication, and analytics." },
    { version: "v1.0.0", date: "Initial Release", text: "First public release of the URLTrim engine." },
  ]
  return (
    <section className="flex flex-col items-center justify-center px-5 py-24 border-b border-border/40">
      <div className="text-center mb-12">
        <h2 className="font-mono text-3xl font-bold tracking-tighter uppercase sm:text-4xl">
          Activity
        </h2>
        <p className="mt-4 text-xs font-mono tracking-wide text-muted-foreground">
          Recent system updates and deployment logs.
        </p>
      </div>
      <div className="w-full max-w-2xl border border-border/40 bg-card/10 rounded-md p-6 sm:p-10 overflow-hidden">
        <div className="flex flex-col gap-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-border/50">
          {logs.map((log, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-[10px] font-mono text-muted-foreground">
                {log.version.replace('v', '')}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-lg border border-border/40 bg-background/60 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-mono font-bold text-xs text-foreground uppercase">{log.version}</h4>
                  <span className="font-mono text-[10px] text-muted-foreground">{log.date}</span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{log.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



function SocialCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors group">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border bg-card text-foreground group-hover:bg-background transition-colors">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="font-mono text-sm font-bold">{title}</h3>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">{description}</p>
      </div>
    </a>
  )
}

function Feature({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="px-5 py-6 sm:border-r border-border/40 sm:last:border-r-0">
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
        {number}
      </p>
      <h2 className="mt-7 font-mono text-xl font-bold tracking-tight uppercase">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function LimitsSection() {
  return (
    <section className="flex flex-col items-center justify-center px-5 py-24 border-b border-border/40 bg-background/50">
      <div className="text-center mb-16">
        <h2 className="font-mono text-3xl font-bold tracking-tighter uppercase sm:text-4xl">
          Quotas
        </h2>
        <p className="mt-4 text-xs font-mono tracking-wide text-muted-foreground">
          System limits per identity.
        </p>
      </div>
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center">
        
        {/* Left Card: Guest */}
        <div className="w-full max-w-[320px] border border-border/40 bg-background p-6 sm:p-8 flex flex-col z-0">
          <h3 className="font-mono text-xs text-muted-foreground mb-4 uppercase tracking-widest">Guest Mode</h3>
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-5xl font-bold tracking-tighter">5</span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">/ Day</span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground mb-6 min-h-[40px]">
            Perfect for quick, one-off short links without needing an account.
          </p>
          
          <div className="w-full mb-6">
            <Link href="#url-form" className="flex w-full items-center justify-center border border-border/50 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-muted/50 transition-colors">
              Start Shortening
            </Link>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col">
            <span className="font-mono text-[10px] text-muted-foreground mb-4 uppercase tracking-widest">Included</span>
            <ul className="flex flex-col gap-3 text-[11px] font-mono text-foreground mb-6">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-px">✓</span>
                <span>Random short aliases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-px">✓</span>
                <span>Global edge resolution</span>
              </li>
            </ul>
            <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed mt-auto">
              *Guest limits are tied to IP and subject to strict rate limits.
            </p>
          </div>
        </div>

        {/* Right Card: Registered */}
        <div className="w-full max-w-[380px] border border-border/40 bg-muted/30 backdrop-blur-md p-8 sm:p-10 shadow-xl shadow-black/10 dark:shadow-black/50 z-10 md:-ml-6 mt-6 md:mt-0 flex flex-col">
          <h3 className="font-mono text-xs text-muted-foreground mb-4 uppercase tracking-widest">Registered</h3>
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-6xl font-bold tracking-tighter">50</span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">/ Day</span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground mb-6 min-h-[40px]">
            Designed for users needing custom branding and analytics.
          </p>
          
          <div className="w-full mb-6 flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="flex flex-1 items-center justify-center bg-foreground text-background py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors border border-foreground">
              Create Account
            </Link>
            <Link href="/login" className="flex flex-1 items-center justify-center border border-border/50 bg-background py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-muted/50 transition-colors">
              Log In
            </Link>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col">
            <span className="font-mono text-[10px] text-muted-foreground mb-4 uppercase tracking-widest">What&apos;s included:</span>
            <ul className="flex flex-col gap-3 text-[11px] font-mono text-foreground mb-6">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-px">✓</span>
                <span>Everything in Guest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-px">✓</span>
                <span>Custom branded aliases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-px">✓</span>
                <span>Comprehensive analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-px">✓</span>
                <span>Dashboard management</span>
              </li>
            </ul>
            <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed mt-auto">
              *Accounts are 100% free. Limits reset daily at midnight UTC.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
