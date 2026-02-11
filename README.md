# MRHS STEM Magazine

MRHS STEM Magazine is a full-stack publishing platform for student STEM content. It supports article creation, moderation workflows, role-based admin tooling, newsletter and digest email delivery, and podcast/video integration.

## What This Project Includes

- Public magazine browsing for posts and author pages
- Authenticated user dashboard with profile and settings
- Submission pipeline with moderation and approval/rejection flows
- Admin dashboard for:
  - Submissions review
  - Post management
  - User management (including ban/unban)
  - SM Pods management and YouTube sync
- Email-based notifications, contact form delivery, and periodic digest sending

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Clerk authentication
- Prisma ORM + MongoDB
- Nodemailer for SMTP-based email delivery

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your environment file (`.env`) and add required variables.

3. Generate Prisma client and push schema:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Start development:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

The app currently reads these variables in code:

### Core

- `MONGODB_URI`
- `NEXT_PUBLIC_APP_URL`

### Clerk

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

### Media Uploads (Cloudinary)

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Email / Notifications

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `MODERATOR_EMAIL`
- `STEMMAG_CONTACT_EMAIL`

### Admin Integrations

- `CRON_SECRET` (digest endpoint protection)
- `YOUTUBE_API_KEY` (SM Pods sync)
- `YOUTUBE_CHANNEL_ID` (SM Pods sync)

## Scripts

- `npm run dev` - Run local development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push Prisma schema to database
- `npm run seed` - Seed database
- `npm run ngrok` - Expose local server via ngrok

## Roles and Access

- `USER`: can create and manage their own submissions
- `MODERATOR`: can access admin dashboard and review submissions, except their own
- `ADMIN`: full admin access, including reviewing their own submissions and role management operations

## Deployment Notes

- Development and production do not automatically sync data.
- Each environment uses the database URI provided at deploy/runtime through `MONGODB_URI`.
- If you keep a separate `MONGODB_URI_PROD`, map it to `MONGODB_URI` in your production host environment settings.

## Project Layout

```text
src/
  app/          App routes and API handlers
  actions/      Server actions
  components/   UI and admin panels
  services/     Business logic and integrations
  lib/          Shared utilities (Prisma, logger, helpers)
  types/        TypeScript types
prisma/
  schema.prisma Database schema
  seed.ts       Seed script
scripts/
  utilities and maintenance scripts
```

## License

This project is licensed under the MIT License.
