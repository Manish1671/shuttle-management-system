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
