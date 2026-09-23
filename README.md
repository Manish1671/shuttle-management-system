# CampusRide — Shuttle Management System

A smart campus shuttle management platform built as part of a frontend case study.

## Project Status

Milestone 5 — Rider Bookings & Trip History

Students and staff can book a shuttle, view their reservations, open booking details, cancel an eligible booking, and review trip history. Admin booking management, driver scheduling, route management, and analytics screens are not implemented yet.

### Demo accounts

| Name | Role | ID |
| --- | --- | --- |
| Aarav Sharma | Student | STU2026001 |
| Priya Mehta | Staff | EMP2026012 |
| Transport Office | Administrator | ADM001 |

Students and staff open `/dashboard`. The administrator opens `/admin`. The choice is stored in the browser and kept across refresh. Switch account returns to `/login`.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide

## Planned Features

- Shuttle booking
- Trip history
- Admin booking management
- Driver availability timeline
- Driver scheduling
- Route management
- Driver assignment
- Shuttle usage and demand analytics

## Project Structure

- `src/app` — App Router pages and global styles. `/` redirects to `/login`.
- `src/components` — shared UI, reserved for layout, data display, feedback, and forms.
- `src/features` — product areas (bookings, drivers, schedule, routes, trips, analytics). Empty until those milestones.
- `src/services` — functions the UI will call.
- `src/server` — in-browser mock repository and domain rules, added later.
- `src/data/seed` — demo data, added later.
- `src/store` — shared client state, added later.
- `src/types`, `src/lib`, `src/hooks` — domain types, helpers, and reusable hooks.
- `docs` — architecture and complexity notes.
- `public` — static assets.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page redirects to `/login`.

```bash
npm run lint
npm run typecheck
```

## Case Study

This project is based on the Shuttle Management System case study assigned in the LPU Frontend Case Studies document.
