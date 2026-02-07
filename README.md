# Lift

A simple, minimal workout tracker that runs as a PWA. Manage your workout routines through a built-in CMS, track exercises with configurable sets/reps, and use rest timers — all from your phone or desktop.

## Features

- **Progressive Web App** — install on your phone, works offline
- **Built-in CMS** — manage workout days, exercises, and bookend routines (warmup/cooldown) via Sveltia CMS
- **Rest Timer** — configurable rest duration with sound notification
- **Customizable Defaults** — set default reps, sets, and rest duration in preferences

## Use This Template

1. Click **"Use this template"** on GitHub to create your own repo
2. Deploy to [Cloudflare Pages](https://pages.cloudflare.com/) (or any static host)
3. Open the app and go to **Manage Workouts** to create your workout days and exercises via the CMS

### Deploy to Cloudflare Pages

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/udit-001/workout-tracker)

## Staying Updated

This template includes a GitHub Actions workflow (`.github/workflows/sync-template.yml`) that automatically syncs updates from the upstream template.

- Runs weekly (every Sunday) and can also be triggered manually
- Opens a **pull request** with the changes so you can review before merging
- Your personal workout data in `content/` won't conflict since the template doesn't include those files

To trigger a sync manually: go to **Actions** → **Sync from Template** → **Run workflow**.

## Local Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## Tech Stack

- [Vite](https://vite.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) v4 — styling
- [Vite PWA](https://vite-pwa-org.netlify.app/) — service worker and PWA support
- [Sveltia CMS](https://sveltiacms.app/) — git-based content management
