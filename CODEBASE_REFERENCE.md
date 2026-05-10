# STEMMAG Codebase Reference Guide

A comprehensive reference for developers working on the MRHS STEM Magazine platform.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Key Data Models](#key-data-models)
5. [Code Conventions](#code-conventions)
6. [Common Patterns](#common-patterns)
7. [Environment Variables](#environment-variables)
8. [Scripts & Commands](#scripts--commands)
9. [Deployment](#deployment)

---

## Project Overview

**MRHS STEM Magazine** is a full-stack publishing platform for student STEM content.

**Key Features:**

- Public magazine browsing (posts & author pages)
- Authenticated user dashboard with profiles & settings
- Submission pipeline with moderation & approval workflows
- Role-based admin tooling (submissions, posts, users, SM Pods)
- Email notifications, contact delivery, digest sending
- Newsletter management
- Podcast/video integration via YouTube

**Requirements:** Node.js >=22.0.0 | **License:** MIT

---

## Tech Stack

### Frontend

| Technology                | Purpose                             |
| ------------------------- | ----------------------------------- |
| Next.js 16 (App Router)   | Framework with file-based routing   |
| React 19                  | UI library                          |
| TypeScript                | Type safety                         |
| Tailwind CSS 4            | Utility-first styling               |
| Framer Motion             | Animations                          |
| React Hook Form           | Form state & validation             |
| React Markdown + KaTeX    | Content rendering with math         |
| TanStack React Query      | Client-side data fetching & caching |
| Embla Carousel            | Carousel/slider components          |
| React Hot Toast           | Toast notifications                 |
| Lucide React, React Icons | Icon libraries                      |

### Backend & Database

| Technology | Purpose                          |
| ---------- | -------------------------------- |
| Prisma ORM | Type-safe database access        |
| MongoDB    | NoSQL database                   |
| Clerk      | Authentication & user management |
| Svix       | Webhook management               |

### Services & Integrations

| Service     | Purpose              |
| ----------- | -------------------- |
| Nodemailer  | SMTP email delivery  |
| Cloudinary  | Image hosting & CDN  |
| YouTube API | SM Pods content sync |
| Winston     | Logging              |

### DevOps & Tools

| Tool        | Purpose                   |
| ----------- | ------------------------- |
| Docker      | Containerization          |
| ESLint      | Code linting              |
| Prettier    | Code formatting           |
| Husky       | Git hooks enforcement     |
| Lint-staged | Staged file linting       |
| Commitlint  | Commit message validation |

---

## Folder Structure

```
src/
├── actions/              # Server actions (mutations)
│   ├── draft.actions.ts
│   └── submission.actions.ts
├── app/                  # Next.js App Router (pages & API)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── admin/            # Admin dashboard & pages
│   ├── api/              # API routes & webhooks
│   ├── author/           # Author profile pages
│   ├── dashboard/        # User dashboard
│   ├── posts/            # Post detail pages
│   └── [routes]/         # Feature-specific pages
├── components/           # React components
│   ├── index.ts          # Barrel exports
│   ├── admin/            # Admin-specific components
│   ├── ui/               # UI primitives (buttons, cards, etc.)
│   ├── inputs/           # Form input components
│   ├── loading/          # Loading state components
│   ├── home/             # Homepage components
│   └── [Name].tsx        # Individual components (PascalCase)
├── services/             # Business logic & external APIs
│   ├── emailService.ts
│   ├── cloudinaryService.ts
│   ├── draftService.ts
│   ├── submissionService.ts
│   ├── postService.ts
│   └── [...]Service.ts
├── lib/                  # Utilities & helpers
│   ├── prisma.ts         # Prisma singleton
│   ├── utils.ts          # General utilities (cn, displayNumbers)
│   ├── logger.ts         # Winston logger
│   ├── fetcher.ts        # Data fetching utilities
│   ├── date.ts           # Date utilities
│   ├── imageAttribution.ts
│   ├── contentModeration.ts
│   └── moderation/       # Moderation utilities
├── hooks/                # Custom React hooks
│   ├── index.ts          # Barrel exports
│   ├── useLocalStorage.tsx
│   ├── useMediaQuery.tsx
│   ├── usePosts.ts
│   └── useAPiCall.ts
├── types/                # TypeScript types & interfaces
│   ├── index.ts          # Main types (PostType, Submission, etc.)
│   └── moderation.ts     # Moderation-related types
├── config/               # Configuration constants
│   └── index.ts
├── context/              # React Context
│   └── index.ts
├── env/                  # Environment configuration
│   ├── config.ts
│   └── index.ts
├── providers/            # React providers
│   ├── query.tsx         # TanStack Query provider
│   ├── theme.tsx         # Theme provider (next-themes)
│   └── ToasterProvider.tsx
├── layouts/              # Layout wrappers
│   └── ErrorLayout/
└── styles/               # Global styles
    ├── globals.css
    └── fonts.css

prisma/
├── schema.prisma         # Prisma data model (MongoDB)
└── seed.ts               # Database seeding

public/
└── images/              # Static assets
    ├── carouselimages/
    └── team/

scripts/                  # Maintenance & utility scripts
├── cleanup-duplicate-draft-submissions.mjs
└── cleanup-unset-is-admin.mjs
```

---

## Key Data Models

### User

- **Auth Link:** `clerkId` (unique)
- **Profile:** name, email, image, bio
- **Social:** website, twitter, github, linkedin, instagram, youtube
- **Role:** "USER" | "MODERATOR" | "ADMIN"
- **Relations:** posts, comments, submissions, drafts, newsletter subscription

### Post (Published content)

- **Content:** title, excerpt, content (markdown), coverImage
- **Metadata:** postType (SM_EXPO | SM_NOW | SM_PODS), category, tags[]
- **Links:** projectLinks[], sources
- **Relations:** author, comments, likes

### Submission (Under review)

- **Content:** title, content, images[], youtubeUrl (for SM Pods)
- **Status:** PENDING | APPROVED | REJECTED
- **Review:** reviewedBy, rejectionReason, approvalToken
- **Attribution:** imageAttributions[] for image credits
- **Relations:** author, comments, likes

### Draft (In-progress)

- Similar to Submission but for unsaved work
- **Relations:** author

### Comment & SubmissionComment

- **Content:** content, likes, replies
- **Relations:** author, post/submission

### Additional Models

- `NewsletterSubscription` - Newsletter opt-in tracking
- `NotificationPreferences` - User notification settings
- `SubmissionLike` - Like tracking for submissions

---

## Code Conventions

### Naming Conventions

| Type        | Convention             | Example                                  |
| ----------- | ---------------------- | ---------------------------------------- |
| Components  | PascalCase             | `HeroCarousel.tsx`, `CommentSection.tsx` |
| Services    | camelCase + Service    | `emailService.ts`, `postService.ts`      |
| Hooks       | camelCase + use prefix | `useLocalStorage.tsx`, `usePosts.ts`     |
| Types/Enums | PascalCase             | `PostType`, `SubmissionStatus`           |
| Utilities   | camelCase              | `displayNumbers`, `cn`                   |
| Folders     | lowercase/kebab-case   | `admin`, `home`, `ui`, `form-inputs`     |

### TypeScript Practices

- ✅ Strict mode enabled (`strict: true`)
- ✅ All components are typed
- ✅ Enums for constants (PostType, SubmissionStatus)
- ✅ Interfaces for complex objects
- ✅ Type imports where appropriate
- ✅ Path aliases: `@/*` → `src/*`, `@/public/*` → `public/*`

### React Patterns

- **Server/Client Components:** Next.js App Router (server-first)
- **Server Actions:** Mutations in `/src/actions/`
- **Custom Hooks:** Encapsulated state logic
- **Context Providers:** Wrap app in `providers/` folder components
- **Component Composition:** Use barrel exports (`index.ts`)

### Styling

- **Tailwind CSS 4:** Utility-first approach
- **Class Merging:** `cn()` utility (clsx + twMerge)
- **Dynamic Styling:** Apply conditional classes with `cn()`
- **No CSS-in-JS:** Pure Tailwind utilities

### Forms

- **Framework:** React Hook Form
- **Validation:** Built into react-hook-form
- **Components:** Reusable inputs in `/src/components/inputs/`
- **Submission:** Server actions for mutations

### Data Fetching

- **Client:** TanStack React Query (with caching)
- **Server:** Prisma ORM
- **HTTP:** `fetcher.ts` utility for client calls
- **Mutations:** Server actions

### Email

- **Service:** Nodemailer with SMTP
- **Format:** HTML templates (string-based)
- **Usage:** `emailService.ts` exports functions like `sendSubmissionForReview()`

### Error Handling

- **Boundaries:** `error.tsx` at route level
- **Layouts:** `ErrorLayout` component wrapper
- **Logging:** Winston logger in `lib/logger.ts`

### Linting & Formatting

- **ESLint:** Next.js core-web-vitals
- **Prettier:** Auto-format on commit
- **Husky:** Enforce linting on staged files
- **Relaxed Rules:** Many react-hooks rules disabled (see .eslintrc)

---

## Common Patterns

### Creating a New Service

```typescript
// src/services/[featureName]Service.ts
import prisma from '@/lib/prisma';
import type { SomeType } from '@/types';

export async function doSomething(param: string): Promise<SomeType> {
  // Implementation
}

export async function doSomethingElse(id: string): Promise<void> {
  // Implementation
}
```

### Creating a Server Action

```typescript
// src/actions/[feature].actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

export async function updateSomething(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Implementation
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
```

### Creating a Custom Hook

```typescript
// src/hooks/useSomething.ts
import { useState, useEffect } from 'react';

export function useSomething(param: string) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, [param]);

  return { state };
}
```

### Creating a Component

```typescript
// src/components/MyComponent.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function MyComponent({
  title,
  children,
  className
}: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### Styling with Tailwind + cn()

```typescript
import { cn } from '@/lib/utils';

// Conditional styling
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-black'
)}>
  Click me
</button>

// Merging class conflicts (twMerge handles specificity)
<div className={cn('p-4', userClass)} />
```

---

## Environment Variables

### Core

```
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Clerk (Authentication)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Cloudinary (Media)

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xyz
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=secret123
```

### Email/SMTP

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@stemmag.com
MODERATOR_EMAIL=moderator@example.com
STEMMAG_CONTACT_EMAIL=contact@example.com
```

### Admin Integrations

```
CRON_SECRET=your-secret-key
YOUTUBE_API_KEY=AIzaSyD...
YOUTUBE_CHANNEL_ID=UCxxxxx
```

---

## Scripts & Commands

### Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run build        # Production build
npm run start        # Run production server
npm run build:analyze  # Bundle analysis with ANALYZE=true
```

### Database (Prisma)

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:push       # Push schema changes
npm run seed              # Run seed script
```

### Maintenance

```bash
npm run cleanup:duplicate-drafts  # Clean duplicate drafts
npm run ngrok                      # Expose local app via ngrok
```

---

## Deployment

### Docker

- **Dockerfile** available for containerization
- **docker-compose.yml** for local multi-service setup

### Vercel

- **Native Next.js integration** via `vercel.json`
- **Environment variables** configured in Vercel dashboard
- **Optimized imports** for reduced bundle size
- **React Compiler enabled** for performance

### Build Optimizations

- Turbopack file system cache in dev
- Bundle analyzer available (`npm run build:analyze`)
- Server packages excluded: `nodemailer`, `winston`
- Console removal in production

---

## Notes for Contributors

1. **Type Safety First:** Always add types to function parameters and return values
2. **Use Server Actions:** Prefer server actions over API routes for form submissions
3. **Component Composition:** Break down complex components into smaller, reusable pieces
4. **Naming is Important:** Follow conventions so code is self-documenting
5. **Test in Dark Mode:** Next-themes is integrated; components should work in both light/dark
6. **Image Attribution:** Always track image sources using the attribution system
7. **Email Styling:** Use inline CSS or well-tested HTML email patterns
8. **Accessibility:** Use semantic HTML and ARIA where needed
9. **Performance:** Leverage TanStack Query for caching and Vercel's optimizations
10. **Error Handling:** Always provide meaningful error messages to users

---

**Last Updated:** May 2026 | **Maintained by:** Development Team
