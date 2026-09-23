# Regression checklist

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run validate:seed` before a demo. Then walk the flows below in the browser. Seed counts should stay 8 users, 8 drivers, 6 vehicles, 10 stops, 6 routes, 29 trips, 56 bookings, and 23 schedules.

## Rider

- Student and staff open the rider shell. The administrator opens the admin shell.
- `/book`: choose a date, an active route, a pickup, a later destination, a trip, review, and confirm.
- The new booking appears in My Bookings and the trip's occupied seats increase.
- A second active booking on the same trip is rejected. A reversed stop order is rejected. A completed or cancelled trip is not offered.
- An eligible booking can be cancelled. It stays in history, the seat count drops, and it cannot be cancelled again.
- One rider cannot cancel another rider's booking.
- History lists completed and cancelled bookings newest first. All, Completed, and Cancelled filters work.

## Admin

- `/admin` shows KPIs, today's trips, the demand chart, route utilization, driver status, and alerts, with no `NaN`.
- `/admin/bookings` search and filters work. Details open. An eligible admin cancellation releases the seat.
- `/admin/drivers` lists drivers, opens details, changes the date, edits duty and breaks, and shows the timeline. An invalid duty or a break over a trip is rejected.
- `/admin/routes` search and the active filter work. Details, create, edit, stop order, and activation work. A change that would break an existing booking is rejected.
- `/admin/trips` filters work. Create, edit, assignment, status, overlap, and capacity checks reject invalid saves.
- `/admin/analytics` presets, a custom range, and the route filter update the KPIs and charts. An empty range says there is no data.

## Access

- A rider opening `/admin` returns to `/dashboard`.
- An administrator opening `/book` returns to `/admin`.
- With no selected account, protected pages return to `/login`.
