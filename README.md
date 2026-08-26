<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/logo-light.png" />
  <source media="(prefers-color-scheme: light)" srcset="public/logo-dark.png" />
  <img alt="ShortURL Logo" src="public/logo-dark.png" width="60" />
</picture>

<h1>ShortURL</h1>

<p>Edge-resolved URL shortener — millisecond redirects, globally.</p>

<p>
  <a href="https://github.com/mosabbir-maruf"><img src="https://img.shields.io/badge/by-Mosabbir%20Maruf-111111?style=flat-square" alt="Author" /></a>
  <img src="https://img.shields.io/badge/edge-Cloudflare%20D1-F38020?style=flat-square" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/stack-Next.js%2016-000000?style=flat-square" alt="Next.js" />
</p>

<br/>

</div>

## 🚀 Features

- **Edge Network:** Global CDN resolution with milliseconds latency.
- **Enterprise Security:** Environment-variable-based admin whitelisting, real-time JWT role revocation via Edge DB lookups, and email verification via [Resend](https://resend.com).
- **Email Verification:** New users must verify their email before logging in. Branded, on-theme HTML email templates sent through Resend.
- **D1 Database:** Serverless SQL capabilities for high-performance indexing and fast URL resolution.
- **Analytics:** Built-in click tracking on every redirect.
- **Modern UI:** Monochromatic, minimalist, boxy UI built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

## 📁 File Structure

```text
ShortURL/
├── app/                          # Next.js App Router (UI)
│   ├── dashboard/                # Dashboard for authenticated users
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   └── page.tsx                  # Hero page & main shortener UI
│
├── functions/                    # Cloudflare Pages Functions (Edge)
│   ├── [code].ts                 # Redirect handler (edge-resolved)
│   └── api/
│       ├── shorten.ts            # URL shortening endpoint
│       ├── auth/
│       │   ├── login.ts          # Login with JWT cookie
│       │   ├── register.ts       # Registration + Resend email verification
│       │   └── verify.ts         # Email verification endpoint
│       ├── admin/
│       │   ├── links.ts          # Admin: manage all links
│       │   └── users.ts          # Admin: manage all users
│       └── user/
│           └── links.ts          # User: manage own links
│
├── migrations/                   # D1 database migrations
│   └── schema.sql                # Full database schema
│
├── components/                   # Reusable React components
├── lib/                          # Utility functions, validation, JWT
├── wrangler.toml                 # Cloudflare Workers config
├── .env.example                  # Example environment variables
└── package.json                  # Dependencies and scripts
```

## 🔐 Security Architecture

### Admin Whitelisting
Admin privileges are **never** assigned automatically. Only emails listed in the `ADMIN_EMAILS` environment variable receive the `admin` role upon registration. This eliminates the "first-user" race condition entirely.

### Real-Time Role Revocation
Admin API routes do **not** trust the role stored in the JWT cookie. Instead, every admin request performs a real-time database lookup (`SELECT role FROM users WHERE id = ?`) to verify the user's current role. If you demote or ban someone in the database, their access is revoked **instantly** on the next request.

### Email Verification
New accounts are created with `is_verified = 0`. A branded verification email is sent via Resend containing a unique single-use token. Users **cannot log in** until they click the verification link. The token is cleared from the database after use.

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

 3. **Cloudflare Local Development**
   Use Wrangler to test Pages Functions locally (serves the `out/` static export + `functions/`):
   ```bash
   npx wrangler pages dev out
   ```

4. **Run Database Migration**
   ```bash
   npx wrangler d1 execute shorturl_db --file=./migrations/schema.sql
   ```

5. **Production Build**
   ```bash
   npm run build
   ```

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` or configure in Cloudflare Dashboard:

```env
# Security
JWT_SECRET="your_jwt_secret_here"
PASSWORD_SALT="your_password_salt_here"
ADMIN_EMAILS="your_email@example.com"

# Resend (Email Verification)
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="ShortURL <noreply@yourdomain.com>"

# Domain Configuration
BASE_URL="https://shorturl.pages.dev"
```

## 🚀 Deployment (Cloudflare Pages — Dashboard)

This project is a Next.js static export (`output: "export"`) served by Cloudflare Pages, with edge logic in `functions/` and a D1 database.

1. **Connect Repository**
   Push your code to GitHub, then open the Cloudflare Dashboard and go to **Workers & Pages → Create → Pages** to connect the repository.

   Configure the build settings as follows:
   - **Framework preset:** `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `out`

   Pages Functions are auto-detected from the `functions/` directory, so no extra configuration is needed.
2. **Create the D1 Database**
   ```bash
   npx wrangler d1 create shorturl_db
   ```
   The database ID is already set in `wrangler.toml`. In the Pages project settings, add a D1 database binding with variable name `DB` pointing to `shorturl_db`.
3. **Add Environment Variables**
   In **Settings → Variables and Secrets** (use "Secret" for `JWT_SECRET`, `PASSWORD_SALT`, `RESEND_API_KEY`), set the same variables listed in the [⚙️ Environment Variables](#️-environment-variables) section above — just point `BASE_URL` at your live `*.pages.dev` (or custom) domain.
4. **Run Database Migration**
   After the first successful deploy, run the migration (same command as in [Installation & Setup](#️-installation--setup)):
   ```bash
   npx wrangler d1 execute shorturl_db --file=./migrations/schema.sql
   ```
5. **Update Domain**
   Set `BASE_URL` to your assigned domain (or custom domain) once available. Do not run `next start` in production — Pages serves the static `out/` assets with the `functions/` edge handlers.

## 🧱 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 16, React 19, Tailwind v4 |
| Edge Runtime| Cloudflare Pages Functions         |
| Database    | Cloudflare D1 (SQLite)            |
| Auth        | Custom JWT + Resend email verify  |
| Deployment  | Cloudflare Pages                  |

