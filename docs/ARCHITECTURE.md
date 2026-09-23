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

Rider and admin routes are placeholders. They render inside the shell and do not contain booking, driver, route, or analytics screens. Domain records exist underneath those screens and are not rendered yet.

### Domain data

```
UI (later milestones)
  ↓
Feature layer (src/features)
  ↓
Service layer (src/services)
  ↓
Repository (src/services/repository)
  ↓
localStorage, seeded from src/data/seed
```

Services are the only API future screens should call. They do not import React. Pages must not import seed arrays. The repository is a set of in-memory collections keyed by id. On the first browser load, or when `campusride:schema-version` changes, each collection is copied from seed into `localStorage`. Later loads read those keys. Server rendering never touches `localStorage`; a read during rendering returns the seed, and a write in that environment throws.

Dates are `YYYY-MM-DD`. Times are `HH:mm`. A booking timestamp is `YYYY-MM-DDTHH:mm`. Relationships are ids, not nested copies. Route `stopIds` keep stop order.

`validateDataset` checks the seed for dangling ids, stop order, pickup and drop-off order, capacity, driver and vehicle overlaps, and duty and break rules. Cancelled bookings do not occupy a seat. Cancelled trips do not block a driver or vehicle. Run it with `npm run validate:seed`.

### Rider booking

```
/book
  ↓
Booking flow (src/features/booking-flow)
  ↓
bookingService.searchBookableTrips / createBooking
  ↓
Repository
  ↓
localStorage
```

A rider chooses a date, an active route, then a pickup and a later stop on that route. The search reads trips and bookings and does not write. Only `scheduled` and `boarding` trips with a free seat are shown. Completed, cancelled, in-progress, departed, and full trips are left out. Confirming calls `createBooking`, which checks the user, trip, route, stop order, duplicate booking, and remaining seats again before writing. The new record uses an id such as `BK-1001`. The trip's `bookedSeats` count is updated to match occupied seats.

### Rider bookings and history

```
/bookings and /history
  ↓
Booking and history features
  ↓
bookingService.getBookingsForUser / cancelBooking
  ↓
Repository
  ↓
localStorage
```

The pages read only the signed-in rider's bookings and resolve trip, route, driver, vehicle, and stops into a `BookingViewModel`. Upcoming reservations are the nearest first. History is the newest trip first. Cancellation is `cancelBooking`: the service checks ownership, then refuses completed, started, boarding, or already cancelled bookings. A successful cancel sets the booking status to `cancelled` and recalculates `bookedSeats`. The record is kept. Admin booking management is still a placeholder.

### Admin operations dashboard

```
/admin
  ↓
Admin dashboard feature
  ↓
Domain services (trips, bookings, drivers, vehicles, routes, stops, users, schedules)
  ↓
Repository
  ↓
localStorage
```

The overview is read-only. It loads each collection once, then derives today's trips, booking counts, hourly demand, route utilization, and alerts. Cancelled bookings do not count as demand or toward seat totals. Active trips are `boarding` and `in_progress` only.

Driver availability is derived for the service date. A driver on a boarding or in-progress trip is On trip. Otherwise the duty schedule and the current clock decide Available, On break, or Off duty. The stored `Driver.status` field is not used for this screen, so the dashboard stays aligned with the timetable.

The repository can later be replaced by an HTTP API without rewriting feature screens, because those screens will depend on the service functions rather than on storage.

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
| Recharts | Hourly demand chart on the admin overview |
| ESLint (`eslint-config-next`) | Lint rules for Next.js and TypeScript |

React Hook Form and Zod are used by the booking search form. Vitest is not installed. Redux, Zustand, a database, and a separate API are out of scope for the MVP.

## Layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Routes | `src/app` | Pages and layouts. Placeholders only at this stage. |
| UI | `src/components` | Shared layout and visual primitives |
| Features | `src/features` | Screen-level modules. Auth is the only feature so far. |
| Services | `src/services` | Domain reads and writes used by future screens |
| Repository | `src/services/repository` | Collection storage over localStorage |
| Seed data | `src/data/seed` | The initial campus network |
| Types | `src/types` | User, driver, vehicle, stop, route, trip, booking, schedule |
| Lib | `src/lib` | Time parsing and validation helpers |

`src/store` and `src/server` are reserved and unused. Shared client state is not needed while services read storage directly.
