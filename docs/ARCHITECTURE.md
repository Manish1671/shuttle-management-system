# CampusRide architecture

CampusRide is the product name for the Shuttle Management System, a smart campus transit frontend. The repository name is `shuttle-management-system`.

## Purpose

Students and staff book campus shuttle rides and review their trip history. Transport administrators manage bookings, driver duty and breaks, routes and stops, driver assignments, and shuttle usage so peak hours can be scheduled more effectively.

Domain behaviour such as booking, scheduling, and analytics is added in later milestones. There is still no backend or database.

## Current architecture

```
Browser
  └── Next.js App Router
        ├── /                         redirects to /login
        ├── /login                    demo account picker
        ├── (rider)                   RoleGuard role="rider" + RiderShell
        │     ├── /dashboard
        │     ├── /book
        │     ├── /bookings
        │     └── /history
        └── (admin)/admin             RoleGuard role="admin" + AdminShell
              ├── /admin
              ├── /admin/bookings
              ├── /admin/drivers
              ├── /admin/routes
              ├── /admin/trips
              ├── /admin/vehicles
              └── /admin/analytics
```

Rider and admin routes are placeholders. They render inside the shell and do not contain booking, driver, route, or analytics logic.

### Demo authentication

Sign-in is a demo account picker, not an authentication provider. `CurrentUserProvider` (`src/features/auth/current-user-provider.tsx`) holds the selected `DemoUser` in React context. The user id is stored in `localStorage` under `campusride.userId` and read after mount, so the server render does not touch `localStorage`. `useCurrentUser` exposes `user`, `isReady`, `selectUser`, and `logout`.

Demo accounts live in `src/features/auth/demo-users.ts`. Roles are `rider` and `admin`. Riders are also marked `student` or `staff`.

### Route protection

`RoleGuard` is a client component used by the rider and admin layouts. Until `isReady` is true it shows a loading state. With no selected user it redirects to `/login`. A rider who opens `/admin` is sent to `/dashboard`. An admin who opens a rider route is sent to `/admin`. This is client-side only and is appropriate for the demo.

### Layout

`AppShell` renders the desktop sidebar, the mobile navigation sheet, the top bar, and the page content. `RiderShell` and `AdminShell` pass the matching navigation list. `AppSidebar` highlights the active route with `aria-current="page"` and can collapse to icons from tablet width upward. Below the `md` breakpoint the sidebar is a sheet opened from the top bar.

Shared primitives from shadcn/ui used by the shell are button, avatar, sheet, dropdown menu, separator, and tooltip. Icons come from Lucide.

## Technology stack

| Technology | Role in this project |
| --- | --- |
| Next.js 16 (App Router) | Routing, layouts, and the production build |
| React 19 | UI and the current-user context |
| TypeScript (strict) | Typed domain model and components |
| Tailwind CSS 4 | Styling from shared design tokens |
| shadcn/ui | Accessible shell primitives |
| Lucide | Icons |
| ESLint (`eslint-config-next`) | Lint rules for Next.js and TypeScript |

Planned, not installed yet: React Hook Form, Zod, Recharts, and Vitest. Mock domain data will live in the browser. Redux, Zustand, a database, and a separate API are out of scope for the MVP.

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
