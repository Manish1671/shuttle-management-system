# Complexity analysis

The repository stores each entity in an array. There is no secondary index yet. `n` is the number of records in the collection being scanned. `k` is the number of trips or breaks being compared for one driver, vehicle, or schedule.

## Repository

| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| `getAll` | O(n) | O(n) | Copies the array so callers cannot mutate the cache. |
| `getById` | O(n) | O(1) | Linear scan by `id`. |
| `create` | O(n) | O(n) | Scans for a duplicate id, then writes the whole collection to `localStorage`. |
| `update` | O(n) | O(n) | Finds the record and rewrites the collection. |
| `delete` | O(n) | O(n) | Filters the collection and rewrites it. |

These costs are acceptable for the current campus dataset (under 100 records per collection). An id map would make `getById` O(1) if the collections grow.

## Domain checks

| Check | Time | Space | Notes |
| --- | --- | --- | --- |
| Route stop references | O(s) | O(1) | `s` is the number of stop ids on that route. |
| Pickup before drop-off | O(s) | O(1) | Two `indexOf` scans of the route's ordered stop list. |
| Trip capacity | O(b) | O(1) | `b` is the number of bookings on that trip. Cancelled bookings are skipped. |
| Duty and breaks | O(k²) | O(k) | Each break is compared with the others on the same schedule. |
| Driver or vehicle overlap | O(k log k) | O(k) | Trips are grouped by date, sorted by departure, then scanned once. Cancelled trips are ignored. A trip that ends when the next one starts is not a conflict. |

Dataset integrity runs these checks across the seed once. That pass is O(n²) in the worst case because each trip looks through the booking list. The seed is small enough that this stays instant.

## Rider booking

`t` is the number of trips. `b` is the number of bookings. `s` is the number of stops on the selected route.

| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| Find trips for a route and date | O(t + b) | O(t) | Bookings are grouped by trip once, then every trip is filtered. |
| Available seats | O(bₜ) | O(1) | `bₜ` is the bookings on that trip. Cancelled bookings are skipped. `bookedSeats` on the trip is not used. |
| Duplicate booking | O(bₜ) | O(1) | Looks for a non-cancelled booking for the same user and trip. |
| Pickup before drop-off | O(s) | O(1) | Two scans of the route's ordered stop list. |
| Create booking | O(t + b) | O(b) | Re-reads trips and bookings, then appends one booking and rewrites both collections. |
| User bookings | O(b + t) | O(bᵤ) | Scans bookings for one user, then resolves each related record from arrays already loaded once. |
| Sort bookings | O(bᵤ log bᵤ) | O(bᵤ) | Compared by `YYYY-MM-DDTHH:mm`. Upcoming is ascending. History is descending. |
| History filter | O(bᵤ) | O(bᵤ) | One pass over the rider's past and cancelled views. |
| Cancel booking | O(b) | O(b) | Finds the booking, updates its status, recounts occupied seats, and rewrites both collections. |

## Admin dashboard

The overview reads each collection once, builds id maps, and groups non-cancelled bookings by trip. Later sections reuse those maps. Nothing is written.

| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| Load collections | O(n) | O(n) | One `getAll` per collection. `n` is the stored records copied out of the repository. |
| Daily metrics | O(t + b) | O(t) | Today's trips are filtered once. Occupied seats are the grouped booking lists. |
| Hourly demand | O(t) | O(h) | One pass over today's trips. `h` is the hours between the first and last departure, at most 24. |
| Peak hour | O(h) | O(h) | Every hour that matches the highest non-zero count is returned, so a tie stays a tie. |
| Route utilization | O(t) | O(r) | Non-cancelled trips are summed by route. Cancelled trips are left out of both bookings and capacity. |
| Driver status summary | O(d) | O(d) | Each driver is classified from today's trips and that driver's schedule. The stored driver status is not read. |

## Admin booking management

Collections are read once and indexed by id. Each booking is resolved from those maps, so related records are not looked up again per table row.

| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| Load and resolve | O(b + n) | O(b + n) | `b` bookings and `n` related records. One map lookup per relationship. |
| Filter | O(b) | O(b) | Search, status, trip date, and route are one pass. The input is already sorted. |
| Sort | O(b log b) | O(b) | Newest trip date first, then later departure, then booking id. |
| Admin cancel | O(b) | O(b) | Same write as a rider cancel: status update, occupied-seat recount, both collections rewritten. |

## Driver availability

Drivers, schedules, trips, routes, and vehicles are loaded once per refresh and indexed by id. The visible timeline window is one pass over that date's duty times and trips. Each driver is then classified from the in-memory lists.

| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| Load the day | O(d + s + t + r + v) | O(d + s + t) | `d` drivers, `s` schedules, `t` trips, plus route and vehicle maps. No per-cell repository reads. |
| Driver status | O(tᵈ) | O(1) | Same rule as the dashboard: an active trip, otherwise the clock against duty and breaks. `tᵈ` is that driver's trips on the date. |
| Timeline | O(k log k) | O(k) | `k` is the duty, break, and trip boundaries for one driver. Adjacent segments of the same kind are merged. |
| Conflicts | O(tᵈ log tᵈ + tᵈ · bᵈ) | O(tᵈ) | Overlapping trips use the existing sort-and-scan. Each trip is also compared with duty and that day's breaks. |
