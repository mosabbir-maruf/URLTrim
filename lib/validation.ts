import { z } from "zod";

export const urlSchema = z.object({
  url: z.string().url().refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Only HTTP and HTTPS URLs are allowed"),
});
