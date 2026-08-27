import { z } from "zod";

// Practical email format check: requires a local part, an "@", a domain, and a TLD.
// Rejects "abc", "a@b", "test@" while accepting normal addresses.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts scheme-less input (e.g. "animewarp.app", "www.animewarp.app") and
// normalizes it to a valid https URL before validation/storage.
const normalizeUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const urlSchema = z.object({
  url: z
    .string()
    .transform(normalizeUrl)
    .pipe(
      z.string().refine((url) => {
        try {
          const parsed = new URL(url);
          // Require http/https and a real domain (hostname must contain a dot),
          // so bare text like "djhaefsjbhsfd" is rejected rather than shortened.
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
          if (!parsed.hostname.includes(".")) return false;
          return true;
        } catch {
          return false;
        }
      }, "Please enter a valid URL with a domain (e.g. example.com)")
    ),
});
