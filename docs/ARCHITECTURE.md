# CampusRide architecture

CampusRide is the product name for the Shuttle Management System, a smart campus transit frontend. The repository name is `shuttle-management-system`.

## Purpose

Students and staff book campus shuttle rides and review their trip history. Transport administrators manage bookings, driver duty and breaks, routes and stops, driver assignments, and shuttle usage so peak hours can be scheduled more effectively.

This document describes the foundation only. Domain behaviour is added in later milestones.

## Current architecture

The application is a single Next.js App Router project. There is no backend, database, or authentication service.

```
Browser
  └── Next.js App Router (src/app)
        ├── /           redirects to /login
        └── /login      placeholder only
```

`src/app/layout.tsx` owns the document shell, the Geist font, and application metadata. Visual tokens live in `src/app/globals.css` and are exposed to Tailwind through `@theme`.

Empty directories under `src/` reserve the layers below. They contain no domain code yet.

## Technology stack

| Technology | Role in this project |
| --- | --- |
| Next.js 16 (App Router) | Routing, layouts, and the production build |
| React 19 | UI |
| TypeScript (strict) | Typed domain model and components |
| Tailwind CSS 4 | Styling from shared design tokens |
| ESLint (`eslint-config-next`) | Lint rules for Next.js and TypeScript |

Planned, not installed yet: shadcn/ui, Lucide, React Hook Form, Zod, Recharts, and Vitest. Mock data will live in the browser. Redux, Zustand, a database, and a separate API are out of scope for the MVP.

## Planned layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Routes | `src/app` | Pages, layouts, and route-level loading and error UI |
| UI | `src/components` | Shared layout, display, feedback, and form primitives |
| Features | `src/features` | Screens and components grouped by product area |
| Services | `src/services` | Async functions the UI calls |
| Server (in-browser) | `src/server` | Mock repository and domain rules |
| Seed data | `src/data/seed` | Deterministic demo data |
| Store | `src/store` | Shared client state hydrated from the repository |
| Types | `src/types` | Domain types |
| Lib | `src/lib` | Time helpers, formatting, and validation schemas |
| Hooks | `src/hooks` | Small reusable hooks |

Feature modules will call services. Services will call the repository. Validation will live with the repository so the UI cannot bypass it. Replacing the repository with HTTP calls later should not require rewriting pages.
