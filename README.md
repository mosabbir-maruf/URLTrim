# Admin Dashboard

A centralized, secure administration dashboard for managing portfolio data, projects, and incoming contact requests. Built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **Firebase**.

## 🚀 Features
- **Project Management:** Add, edit, delete, and reorder projects (integrated with `@dnd-kit`).
- **Contact Inquiries:** View and manage incoming messages from the portfolio contact form.
- **Analytics:** Integration with Google Analytics Data API to view basic traffic and metrics.
- **Migration Tool:** A built-in `/migrate` script to factory-reset and seed the Firebase database with predefined JSON data.
- **Monorepo Ready:** Leverages shared internal packages (`@workspace/ui`, `@workspace/firebase`).

## 📁 File Structure

```text
admin/
├── .env.local             # Environment variables (local dev)
├── .env.example           # Example environment variables
├── package.json           # Dependencies and scripts
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
│
├── app/                   # Next.js App Router
│   ├── api/               # Serverless API Routes
│   ├── dashboard/         # Main Admin Dashboard view
│   ├── contact/           # Contact inquiries management view
│   ├── login/             # Authentication view
│   ├── migrate/           # Database migration tool view
│   ├── layout.tsx         # Root layout wrapper
│   └── page.tsx           # Entry page
│
├── components/            # Reusable React components
│   ├── admin-chrome.tsx   # Core admin layout shell
│   ├── provider.tsx       # State/Auth providers
│   └── theme-provider.tsx # Dark/Light mode provider
│
└── public/                # Static public assets (icons, logos)
```

## ⚙️ Environment Variables

Copy the `.env.example` file to `.env.local` and fill in your credentials.

```bash
cp .env.example .env.local
```

### `.env.example`
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="1:your_sender_id:web:your_app_id"

# Google Analytics Admin API (For Dashboard Stats)
GA_CLIENT_EMAIL="your_service_account_email@gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
GA_PROPERTY_ID="your_ga4_property_id"

# Telegram Bot Integration (For Notifications)
TELEGRAM_CHAT_ID="your_chat_id"
TELEGRAM_BOT_TOKEN="your_bot_token"
```

## 🛠️ Installation & Setup

1. **Install Dependencies**
   From the root of the monorepo, run:
   ```bash
   npm install
   ```

2. **Start Development Server**
   Start the local Next.js dev server on port 3001:
   ```bash
   npm run dev
   ```

3. **Database Migration**
   If this is your first time setting up the Firebase backend, navigate to `http://localhost:3001/migrate` in your browser and click "Migrate" to seed your database with the starting projects data.

4. **Production Build**
   ```bash
   npm run build
   ```
