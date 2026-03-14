# 🖼 PixVault — Image Management System

A full-stack image management system with metadata search, built with **Next.js + PostgreSQL + Cloudinary**, deployable on **Vercel** for free.

---

## ✨ Features

- **User Authentication** — Register/Login with JWT tokens in secure httpOnly cookies
- **Image Upload** — Drag & drop upload with Cloudinary cloud storage
- **Metadata Tagging** — Tag images with persons, tags, and descriptions
- **Smart Search** — Search by person name, tag, image name, or upload date (SQL JOINs)
- **SQL Explorer** — 25 live SQL queries demonstrating DBMS concepts on your real data
- **Edit & Delete** — Update metadata or remove images anytime
- **Responsive UI** — Dark theme, mobile-friendly

---

## 🗄 Database Schema

```
Users (1) ──────── (N) Images
                        │
                   ┌────┴─────┐
              Image_Person   Image_Tag
                   │               │
                Persons           Tags
```

| Table | Purpose |
|-------|---------|
| `users` | User accounts (auth) |
| `images` | Image metadata + Cloudinary URL |
| `persons` | People who appear in images |
| `tags` | Descriptive tags |
| `image_person` | Many-to-many: images ↔ persons |
| `image_tag` | Many-to-many: images ↔ tags |

---

## 🚀 Deployment on Vercel (Step-by-Step)

### Step 1 — Get a Free PostgreSQL Database (Neon)

1. Go to **https://neon.tech** and sign up (free)
2. Click **New Project** → give it a name → Create
3. On the dashboard, copy the **Connection String** — it looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this as `DATABASE_URL`

> The schema (tables) are **auto-created** on first API call — no manual SQL needed!

---

### Step 2 — Get a Free Cloudinary Account

1. Go to **https://cloudinary.com** → Sign Up (free)
2. From your Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

### Step 3 — Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### Step 4 — Deploy on Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **Add New Project** → Import your GitHub repo
3. Framework will auto-detect as **Next.js**
4. Before deploying, click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Any long random string (e.g. `openssl rand -base64 32`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

5. Click **Deploy** — done! 🎉

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.local.example .env.local
# Edit .env.local with your actual credentials

# 3. Run development server
npm run dev

# Visit http://localhost:3000
```

---

## 📁 Project Structure

```
image-mgmt/
├── pages/
│   ├── index.js          # Home/landing page
│   ├── login.js          # Login page
│   ├── register.js       # Register page
│   ├── dashboard.js      # User image gallery
│   ├── upload.js         # Upload new image
│   ├── search.js         # Search images
│   ├── sql-explorer.js   # 25 SQL queries explorer
│   └── api/
│       ├── auth/
│       │   ├── register.js
│       │   ├── login.js
│       │   ├── logout.js
│       │   └── me.js
│       ├── images/
│       │   ├── index.js  # GET list
│       │   ├── upload.js # POST upload
│       │   └── [id].js   # GET/PUT/DELETE
│       ├── search/
│       │   └── index.js
│       └── run-query/
│           ├── list.js
│           └── [id].js   # 25 SQL queries
├── components/
│   ├── Navbar.js
│   ├── ImageCard.js
│   └── ImageDetailModal.js
├── lib/
│   ├── db.js             # PostgreSQL connection
│   ├── auth.js           # JWT helpers
│   └── cloudinary.js     # Image upload/delete
├── styles/
│   └── globals.css
├── vercel.json
├── next.config.js
└── package.json
```

---

## 🔍 SQL Explorer — 25 Queries

| # | Query | Category |
|---|-------|----------|
| 1 | Show All Images | Basic Select |
| 2 | Unique Tags | DISTINCT |
| 3 | Image + Tag Concatenation | String Functions |
| 4 | Images After a Date | Filter / WHERE |
| 5 | Images Without Persons | LEFT JOIN / NULL |
| 6 | Images With Multiple Tags | GROUP BY / HAVING |
| 7 | Images Tagged 'Trip' | JOIN / Filter |
| 8 | Images With Specific Person | Multi-table JOIN |
| 9 | Images in Current Year | Date Functions |
| 10 | Images With 'birthday' | Pattern Matching |
| 11 | Images With 3+ Tags | Aggregation / HAVING |
| 12 | Sort by Upload Date | ORDER BY |
| 13 | Names Where 3rd Letter = 'a' | Pattern Matching |
| 14 | Tagged 'Trip' or 'College' | OR Condition |
| 15 | Tags in 5+ Images | GROUP BY / HAVING |
| 16 | Current Date | Date Functions |
| 17 | Months Since Upload | Date Arithmetic |
| 18 | Upload Summary String | String Functions |
| 19 | Tag Count per Image | Aggregation |
| 20 | Capitalized Names | String Functions |
| 21 | Day of Week Uploaded | Date Functions |
| 22 | Image + Person + Tag | Multi-table JOIN |
| 23 | Unique Tags per User | Multi-table JOIN |
| 24 | Images Containing 'a' | Pattern Matching |
| 25 | Most Tagged Images | Aggregation / Subquery |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Auth via **JWT** in httpOnly cookies (not accessible by JS)
- File type validation (jpg, jpeg, png, gif, webp only)
- SQL injection prevention via **parameterized queries**
- Ownership checks before edit/delete operations

---

## 📝 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (React) |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL via Neon |
| Image Storage | Cloudinary |
| Auth | JWT + bcrypt |
| Deployment | Vercel |

> **Why not Django + MySQL?**
> Vercel is a serverless platform — it doesn't support persistent processes (Django server) or a local filesystem (for /media/uploads/). This Next.js version is functionally identical but uses services designed for serverless deployment.
