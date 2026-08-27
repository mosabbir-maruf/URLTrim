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
      z
        .string()
        .url()
        .refine((url) => {
          try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
          } catch {
            return false;
          }
        }, "Only HTTP and HTTPS URLs are allowed")
    ),
});
