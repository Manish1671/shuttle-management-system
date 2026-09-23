# CampusRide

CampusRide is a campus shuttle booking and operations demo. Students and staff reserve seats. The transport office manages the timetable, drivers, routes, and a descriptive view of demand.

This is a frontend case study. Data lives in the browser. There is no production backend.

## Features

Rider:

- Shuttle booking
- My Bookings, including cancellation of eligible reservations
- Trip history

Admin:

- Operations dashboard
- Booking management
- Driver duty, breaks, and an availability timeline
- Route and ordered-stop management
- Trip management with driver and vehicle assignment
- Transport analytics

`/admin/vehicles` is a placeholder. The rider dashboard shows the signed-in rider's next ride and booking counts.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide icons
- Recharts
- React Hook Form and Zod for the booking search form

## Architecture

```
UI
  ↓
features and hooks
  ↓
services and domain validation
  ↓
repository
  ↓
localStorage
```

Screens call services. Services validate, then read and write collections. The repository copies seed data into `localStorage` on the first browser visit. Server rendering does not write to storage. See `docs/ARCHITECTURE.md` and `docs/COMPLEXITY.md`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/` redirects to `/login`.

## Demo Accounts

| Name | Role | ID |
| --- | --- | --- |
| Aarav Sharma | Student | STU2026001 |
| Priya Mehta | Staff | EMP2026012 |
| Transport Office | Administrator | ADM001 |

Students and staff land on `/dashboard`. The administrator lands on `/admin`. The chosen id is stored as `campusride.userId`. Switch account returns to `/login`. This is a demo picker, not an authentication system.

## Main Routes

Rider:

- `/book`
- `/bookings`
- `/history`
- `/dashboard`

Admin:

- `/admin`
- `/admin/bookings`
- `/admin/drivers`
- `/admin/routes`
- `/admin/trips`
- `/admin/analytics`
- `/admin/vehicles` (placeholder)

A rider who opens an admin URL is sent to `/dashboard`. An administrator who opens a rider URL is sent to `/admin`.

## Validation

Writes go through services and return `{ ok: false, errors: [{ code, message }] }`. The protections include:

- Seat capacity and duplicate active bookings
- Pickup before destination, on an active route, using active stops
- Route and stop codes, at least two distinct stops, and protection of existing bookings
- Driver duty, breaks, and overlapping trips
- Vehicle overlap, inactive or maintenance vehicles, and capacity below occupied seats
- Forward-only trip status changes

A regression checklist is in `docs/REGRESSION.md`.

## Testing

```bash
npm test
npm run lint
npm run typecheck
npm run validate:seed
```

`npm test` runs the domain invariant tests with Node's test runner. `npm run validate:seed` checks the seeded dataset.

## Project Structure

- `src/app` — App Router pages and layouts
- `src/features` — booking, history, and admin screens
- `src/services` — domain services, repository, and invariant tests
- `src/components` — shell and shared UI
- `src/data/seed` — the initial campus dataset
- `src/types` and `src/lib` — domain types, time helpers, and validation
- `docs` — architecture, complexity, and the regression checklist

## Known Limitations

- Frontend only. Persistence is `localStorage`, not a database or API.
- Sign-in is a demo account picker.
- Vehicle management (`/admin/vehicles`) is a placeholder.
- There is no live GPS, payments, notifications, or production deployment.
- Tests cover domain rules. They do not drive the browser.
