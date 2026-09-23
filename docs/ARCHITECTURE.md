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

The pages read only the signed-in rider's bookings and resolve trip, route, driver, vehicle, and stops into a `BookingViewModel`. Upcoming reservations are the nearest first. History is the newest trip first. Cancellation is `cancelBooking`: the service checks ownership, then refuses completed, started, boarding, or already cancelled bookings. A successful cancel sets the booking status to `cancelled` and recalculates `bookedSeats`. The record is kept.

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

### Admin booking management

```
/admin/bookings
  ↓
Admin bookings feature
  ↓
bookingService.getAll / cancelBookingForAdmin
  ↓
Repository
  ↓
localStorage
```

The page loads bookings, trips, routes, stops, drivers, vehicles, and users once, then builds one view per booking from id maps. Search, status, date, and route filters run on that list. Summary counts use the full list: confirmed excludes cancelled, and today's count uses the trip service date.

`cancelBookingForAdmin` applies the same eligibility rules as a rider cancellation and skips the passenger-ownership check. It sets the booking to `cancelled`, recounts `bookedSeats`, and keeps the record. Rider My Bookings and the admin dashboard read that same write.

### Driver management and availability

```
/admin/drivers
  ↓
Driver feature (list, timeline, schedule editor)
  ↓
scheduleService / driverService / tripService
  ↓
Repository
  ↓
localStorage
```

Breaks are stored on the driver's schedule for that date, not in a separate collection. `saveDuty`, `addBreak`, `updateBreak`, and `removeBreak` validate with `validateDriverSchedule` before writing. A saved change notifies the same revision the dashboard already watches, so driver status stays aligned.

The timeline is built from that date's duty, breaks, and non-cancelled trips. Outside duty is off duty. Inside duty, a trip overrides a break, and a break overrides open time. `findDriverAssignmentConflicts` reports overlapping trips, trips outside duty, trips during a break, and trips with no schedule. Those conflicts are shown and are not rewritten.

### Route and stop management

```
/admin/routes
  ↓
Route feature
  ↓
routeService.saveRoute / stopService.saveStop
  ↓
Repository
  ↓
localStorage
```

A route keeps an ordered `stopIds` list. That order is what rider booking uses to require the pickup before the destination. Reordering writes the same list. Removing a stop from a route does not delete the stop. Stop ids stay stable when a name or code is edited, and route ids stay stable so trips and bookings keep their references.

`saveRoute` checks the route shape with `validateRouteStops`, then refuses an order that would put an active booking's pickup at or after its destination. Deactivating a route leaves it in storage and hides it from new booking. The booking catalog rebuilds when route data changes, and it only offers active routes. Inactive stops are left off the new-booking stop list. Historical bookings still resolve the stop by id.

### Trip management

```
/admin/trips
  ↓
Trip feature
  ↓
tripService.saveTrip / tripService.setTripStatus
  ↓
Repository
  ↓
localStorage
```

A trip stores its own departure and arrival. When the route or departure changes, arrival is departure plus that route's `estimatedDurationMinutes`, using `addMinutesToTime`. Conflict checks use that same interval. `bookedSeats` is recounted from non-cancelled bookings and is not edited in the form. Capacity is the assigned vehicle's capacity.

`saveTrip` refuses an inactive route or an out-of-service vehicle on a new assignment, a driver conflict from `findDriverAssignmentConflicts`, and a vehicle overlap from `validateVehicleTripOverlap`. Only conflicts introduced by the trip being saved are enforced, so an unrelated existing assignment does not block a clean slot. A route change is rejected when a non-cancelled booking would lose a valid pickup-before-destination pair. Those bookings are not rewritten.

Status moves forward only: scheduled, boarding, and in progress can advance or be cancelled. Completed and cancelled trips do not return to an earlier status. Cancelling keeps the trip and its bookings.

### Transport analytics

```
/admin/analytics
  ↓
One load of trips, bookings, routes, drivers, and vehicles
  ↓
Filter by service date and route
  ↓
Shared operations metrics
  ↓
Charts and tables
```

`src/services/operations-metrics.ts` is the shared definition used by the operations dashboard and analytics. An operating trip is any trip that is not cancelled. An active trip is boarding or in progress. Demand counts bookings that occupy a seat, grouped by the departure hour or the service date. Peak hours are every hour tied for that highest count. Route utilization and average occupancy are occupied seats divided by capacity on operating trips. Cancellation rate is cancelled bookings divided by every booking on the filtered trips. Zero capacity or zero bookings display as "—".

The analytics page does not forecast demand. Driver and vehicle sections count assigned trips. Assigned minutes are the sum of operating trip durations.

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
