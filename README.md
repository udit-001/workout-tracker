# Lift

A minimal PWA workout tracker. Manage routines via a built-in CMS, track sets/reps, and use rest timers — on any device.

## Features

- **PWA** — installable, works offline
- **Built-in CMS** — manage workouts and exercises via Decap CMS
- **Rest Timer** — configurable duration with sound notification
- **Customizable Defaults** — default reps, sets, and rest duration

## Quick Start

1. Click **"Use this template"** on GitHub
2. Deploy to Cloudflare Pages (or any static host)
3. Open the app → **Manage Workouts** to add exercises

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/udit-001/workout-tracker)

## Staying Updated

This template includes GitHub Actions workflows that keep your copy in sync:

- **Sync from Template** — pulls upstream updates weekly (Sundays) via PR
- **Sync CMS Defaults** — updates CMS config when preferences change

### Setup

1. Go to your repository on GitHub
2. Navigate to **Settings → Actions → General** ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#configuring-the-default-github_token-permissions))
3. Under **Workflow permissions**, select **"Read and write permissions"**
4. Check **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**
6. Go to the **Actions** tab and enable both workflows

Your `content/` data won't conflict. Manual trigger: **Actions → Sync from Template → Run workflow**.

## Development

```bash
pnpm install
pnpm dev        # dev server
pnpm build      # production build
pnpm preview    # preview build
```

## Tech Stack

[Vite](https://vite.dev/) · [Tailwind CSS](https://tailwindcss.com/) v4 · [Vite PWA](https://vite-pwa-org.netlify.app/) · [Decap CMS](https://decapcms.org/)
