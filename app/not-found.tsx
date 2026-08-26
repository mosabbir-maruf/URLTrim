import Link from "next/link";
import { Link2Off } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-full mb-6">
        <Link2Off className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Link not found</h1>
      <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8 text-lg">
        The short link you are looking for doesn&apos;t exist, has been disabled, or has expired.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium rounded-xl transition-colors"
      >
        Shorten a new URL
      </Link>
    </main>
  );
}
