# Shrtn — Free URL Shortener

Shrtn is a fast, minimal, and modern URL shortener built for Cloudflare Pages and D1. It provides lightning-fast edge redirects with zero cold starts, and a premium minimal UI.

## Features

- **Fast Edge Redirects**: Redirects happen directly at the Cloudflare Edge without rendering React.
- **Zero-Config Database**: Uses Cloudflare D1 for serverless SQLite storage.
- **Privacy-Friendly**: No trackers, no ad-injections, just simple links.
- **Secure**: Short-code collision handling, URL scheme validation (Zod), and reserved route protections.
- **Minimal UI**: Clean, responsive, accessible design with Tailwind CSS and Lucide Icons.

## Tech Stack

- **Framework**: Next.js (App Router, Edge Runtime)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Cloudflare D1
- **Deployment**: Cloudflare Pages
- **Validation**: Zod

## Architecture

1. **URL Creation**:
   `POST /api/shorten` -> Validates URL -> Generates 6-char short code -> Checks for collisions in D1 -> Inserts -> Returns short URL.
2. **Redirects**:
   `GET /[code]` -> Intercepted by Next.js Edge route -> Queries D1 -> Increments click counter -> Returns `302 Found` with `Location` header. 
   React is completely bypassed for redirects ensuring <50ms response times globally.

## Local Development

### Prerequisites
- Node.js 18+
- npm
- Wrangler CLI installed (`npm install -g wrangler`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Local D1 Database
Apply the database migrations to your local Wrangler environment:
```bash
npx wrangler d1 migrations apply shrtn_db --local
```

### 3. Run Development Server
For standard Next.js development (without D1 bindings):
```bash
npm run dev
```
*(Note: To test D1 locally with Next.js Pages, you will need to run the Cloudflare build and use `wrangler pages dev`.)*

```bash
npm run pages:build
npx wrangler pages dev .vercel/output/static
```

## Deployment to Cloudflare

### 1. Create a D1 Database
```bash
npx wrangler d1 create shrtn_db
```
*Note: Cloudflare D1 does not use passwords or connection strings. Instead of hardcoding the `database_id` in your codebase, you should link the database to your Pages project securely via the Cloudflare Dashboard (Settings > Functions > D1 database bindings).*

### 2. Apply Migrations to Production
```bash
npx wrangler d1 migrations apply shrtn_db --remote
```

### 3. Deploy to Cloudflare Pages
You can connect your GitHub repository directly in the Cloudflare Dashboard, or deploy via CLI:
```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static
```

## Environment Variables
The application uses the `BASE_URL` variable to construct short links.
In `wrangler.toml` (and Cloudflare Dashboard):
```toml
[vars]
BASE_URL = "https://shrtn.pages.dev"
```

## Project Structure
- `app/` - Next.js App Router
  - `page.tsx` - Minimal landing page
  - `[code]/route.ts` - Edge redirect handler
  - `api/shorten/route.ts` - URL generation API
- `components/` - React components (`url-form.tsx`)
- `lib/` - Helpers (DB connection, short code generation, Zod validation)
- `migrations/` - D1 SQL schema migrations

## Future Improvements
- Link Analytics Dashboard
- Custom aliases
- QR Code generation
- Expiration UI controls
- User Authentication (OAuth)
