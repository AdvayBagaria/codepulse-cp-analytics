# 🚀 CodePulse / CP Atlas

<p align="center">
  <img src="https://img.shields.io/github/stars/AdvayBagaria/codepulse-cp-analytics?style=for-the-badge" alt="GitHub stars" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-Utility%20First-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-8884D8?style=for-the-badge" alt="Recharts" />
  <img src="https://img.shields.io/badge/GitHub%20Pages-Deploy%20Ready-222222?style=for-the-badge&logo=githubpages&logoColor=white" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <b>Competitive programming analytics dashboard with Codeforces sync, local-first storage, goal tracking, and performance intelligence.</b>
</p>

<p align="center">
  <a href="https://advaybagaria.github.io/codepulse-cp-analytics/">Live Demo</a>
  ·
  <a href="https://github.com/AdvayBagaria/codepulse-cp-analytics">Source Code</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#getting-started">Getting Started</a>
  ·
  <a href="#deployment">Deployment</a>
</p>

---

## ✨ Overview

**CodePulse / CP Atlas** helps competitive programmers turn raw Codeforces activity into clear, actionable insight.

It tracks performance, visualizes trends, spots weak topics, and keeps goals and contest history organized in one fast, static, local-first dashboard.

Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**, it is designed to be fast, elegant, and ready for GitHub Pages deployment.

---

## 🎯 Why This Exists

Competitive programming progress is easy to lose track of.

Contest ratings change. Problem lists grow. Weak topics hide in plain sight. Consistency fades unless it is measured.

CodePulse solves that by transforming your CP history into a productively structured view of:

- performance
- strengths
- weaknesses
- consistency
- goals
- contests
- comparisons

It is built for people who want more than raw stats. It is built for people who want direction.

---

## 💎 What Makes It Valuable

Most CP tools show numbers.

**CodePulse shows movement.**

It helps answer questions like:

- Am I improving over time?
- Which topics are costing me points?
- How strong is my contest consistency?
- How do I compare to another Codeforces user?
- What should I focus on next?
- Am I on track for my target rating?

That makes it useful not just as a tracker, but as a decision tool for practice and progress.

---

## ⚡ Features

### 📊 Dashboard Overview

- Connect a Codeforces handle and sync contest / submission data
- View key performance stats in a clean, focused dashboard
- Track essential CP metrics at a glance

### 📈 Advanced Analytics

- Interactive charts and trend tracking
- Rating movement analysis
- Performance summaries over time
- Visual progress signals for long-term improvement

### 🎯 Topic Intelligence

- Topic-based strength and weakness analysis
- Identify categories that need more practice
- Convert raw submission history into useful practice guidance

### 🔎 Problem History

- Search and filter problem history
- Sort by status and other useful attributes
- Revisit old submissions, mistakes, and solved problems quickly

### 🏆 Contest History

- Contest timeline with rating changes
- Participation history
- Better post-contest review and reflection

### ⚔️ User Comparison

- Compare your profile against another Codeforces handle
- Benchmark rating, solved count, and growth patterns
- Great for competition tracking and motivation

### 🎯 Goal Tracking

- Track goals for:
  - rating
  - solved count
  - streaks
  - contest participation
- Keep your CP routine measurable and disciplined

### 💾 Local-First Storage

- Data stays in the browser
- Export and import JSON backups
- No mandatory backend
- Easy to move between sessions and devices with backup support

### 🌐 GitHub Pages Friendly

- Relative asset paths configured for static hosting
- `.nojekyll` support
- Automated deployment workflow included

---

## 🧠 Feature Matrix

| Area            | What You Get                                 |
| --------------- | -------------------------------------------- |
| Dashboard       | Core stats in one place                      |
| Analytics       | Charts, trends, and pattern spotting         |
| Topic Analysis  | Weakness detection and practice guidance     |
| Problem History | Searchable and filterable records            |
| Contest Review  | Contest timeline and rating changes          |
| Comparison      | Side-by-side Codeforces benchmarking         |
| Goals           | Rating, solved, streak, and contest targets  |
| Storage         | Local-first browser storage with JSON backup |
| Deployment      | GitHub Pages-ready static build              |

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Frontend   | React 19                    |
| Language   | TypeScript                  |
| Build Tool | Vite                        |
| Styling    | Tailwind CSS                |
| Charts     | Recharts                    |
| Icons      | Lucide React                |
| Hosting    | GitHub Pages                |
| Storage    | Local-first browser storage |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Install dependencies

```bash
npm ci
```

### Run locally

```bash
npm run dev
```

The app will start on port `3000`.

### Build for production

```bash
npm run build
```

### Type-check

```bash
npm run lint
```

---

## 📜 Scripts

| Script            | Purpose                            |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the local development server |
| `npm run build`   | Build production files             |
| `npm run preview` | Preview the production build       |
| `npm run clean`   | Remove the `dist/` folder          |
| `npm run lint`    | Run TypeScript type-checking       |

---

## 🚀 Deployment

This repository is configured for **GitHub Pages**.

### Deployment setup

- `vite.config.ts` uses absolute asset paths with `base: '/codepulse-cp-analytics/'` for GitHub Pages
- `public/.nojekyll` disables Jekyll processing
- `public/404.html` provides SPA routing fallback
- `.github/workflows/deploy.yml` builds and publishes the `dist/` folder automatically on push to `main`

### Publish flow

- Push to `main`, or
- Run the GitHub Actions workflow manually via the "Workflow dispatch" option

---

## 🔐 Data Storage & Privacy

CodePulse uses a local-first approach.

### Stored locally in the browser

- handle information
- synced contest data
- submission history
- analytics state
- goal progress
- comparison data

### Backup support

- Export your data as JSON
- Import backups anytime
- Save before switching devices or clearing site data

---

## 🔌 Codeforces Integration

Codeforces API requests are used for syncing account data.

This powers:

- contest history
- submission history
- rating changes
- performance analytics
- comparison views

---

## 🧩 Product Principles

- **Fast** — lightweight and responsive
- **Clear** — focused UI without clutter
- **Useful** — built around real competitive programming workflows
- **Local-first** — no unnecessary backend complexity
- **Static-friendly** — deployable on GitHub Pages
- **Extensible** — structured for future features

---

## 🛣️ Roadmap

- Smarter weakness detection
- Practice recommendations based on performance patterns
- Calendar-based consistency tracking
- Richer comparison analytics
- More advanced rating forecasting
- Better export and summary views
- Optional cloud sync in a future version

---

## 🧪 Testing

The project uses **Vitest** for unit testing.

```bash
# Run tests in watch mode
npm test

# Run tests once (CI)
npm run test:run
```

## 🧹 Code Quality

ESLint and Prettier are configured:

```bash
# Check types
npm run lint

# Format code (if Prettier CLI installed)
npx prettier --write .
```

---

## ⭐ Support the Project

If CodePulse helps you track, understand, and improve your CP journey, consider starring the repository.

---

## 🪪 License

This project is licensed under the **MIT License**.
