import { UrlForm } from "@/components/url-form";
import { Zap, Shield, Link as LinkIcon, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Shrtn — Simple URL Shortener",
  description: "Create fast, simple, and shareable short URLs with Shrtn.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-neutral-200 dark:selection:bg-neutral-800 flex flex-col">
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 pt-24 pb-12 flex flex-col justify-center">
        <header className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-neutral-100 dark:bg-neutral-900 rounded-2xl mb-4">
            <LinkIcon className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Short links. <span className="text-neutral-400 dark:text-neutral-500">Simple.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Create fast, shareable short URLs in seconds.
          </p>
        </header>

        <UrlForm />

        <div className="mt-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <Feature 
            icon={<Zap />}
            title="Fast Redirects"
            description="Built on Edge infrastructure for lightning-fast resolution anywhere in the world."
          />
          <Feature 
            icon={<Shield />}
            title="Privacy-Friendly"
            description="We don't inject ads or track personal data. Your privacy is respected."
          />
          <Feature 
            icon={<LinkIcon />}
            title="Simple Links"
            description="Clean and short URLs that look professional when shared."
          />
          <Feature 
            icon={<BarChart3 />}
            title="Free to Use"
            description="Core features are completely free with no hidden fees or expiration surprises."
          />
        </div>
      </div>
      
      <footer className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>&copy; {new Date().getFullYear()} Shrtn. Built for speed.</p>
      </footer>
    </main>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-neutral-600 dark:text-neutral-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
