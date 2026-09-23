import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
    },
  },
  configurable: true,
});

const now = new Date(2026, 8, 23, 8, 0, 0);

let bookingService: typeof import("./booking-service").bookingService;
let tripService: typeof import("./trip-service").tripService;
let routeService: typeof import("./route-service").routeService;
let stopService: typeof import("./stop-service").stopService;
let scheduleService: typeof import("./schedule-service").scheduleService;
let bookingRepository: typeof import("./repository").bookingRepository;

before(async () => {
  ({ bookingService } = await import("./booking-service"));
  ({ tripService } = await import("./trip-service"));
  ({ routeService } = await import("./route-service"));
  ({ stopService } = await import("./stop-service"));
  ({ scheduleService } = await import("./schedule-service"));
  ({ bookingRepository } = await import("./repository"));
});

describe("booking invariants", () => {
  it("rejects a completed trip, a cancelled trip, and a reversed stop order", () => {
    const completed = bookingService.createBooking(
      {
        userId: "STU2026018",
        tripId: "trip_2201",
        pickupStopId: "stop_main_gate",
        dropoffStopId: "stop_library",
      },
      now,
    );
    const cancelled = bookingService.createBooking(
      {
        userId: "STU2026018",
        tripId: "trip_2307",
        pickupStopId: "stop_admin",
        dropoffStopId: "stop_canteen",
      },
      now,
    );
    const reversed = bookingService.createBooking(
      {
        userId: "STU2026018",
        tripId: "trip_2401",
        pickupStopId: "stop_library",
        dropoffStopId: "stop_main_gate",
      },
      now,
    );
    assert.equal(completed.ok, false);
    assert.equal(cancelled.ok, false);
    assert.equal(reversed.ok, false);
    if (!reversed.ok) {
      assert.equal(reversed.errors[0]?.code, "PICKUP_AFTER_DROPOFF");
    }
  });

  it("rejects a duplicate active booking and lets a cancellation release the seat", () => {
    const existing = bookingService.getById("booking_trip_2401_1");
    assert.ok(existing);
    const duplicate = bookingService.createBooking(
      {
        userId: existing.userId,
        tripId: existing.tripId,
        pickupStopId: existing.pickupStopId,
        dropoffStopId: existing.dropoffStopId,
      },
      now,
    );
    assert.equal(duplicate.ok, false);
    if (!duplicate.ok) {
      assert.equal(duplicate.errors[0]?.code, "DUPLICATE_BOOKING");
    }

    const created = bookingService.createBooking(
      {
        userId: "STU2026018",
        tripId: "trip_2310",
        pickupStopId: "stop_main_gate",
        dropoffStopId: "stop_library",
      },
      now,
    );
    assert.equal(created.ok, true);
    if (!created.ok) {
      return;
    }
    const before = tripService.getById("trip_2310");
    const otherRider = bookingService.cancelBooking(created.booking.id, "STU2026044", now);
    assert.equal(otherRider.ok, false);
    if (!otherRider.ok) {
      assert.equal(otherRider.errors[0]?.code, "NOT_OWNER");
    }
    const cancelled = bookingService.cancelBooking(created.booking.id, "STU2026018", now);
    assert.equal(cancelled.ok, true);
    const after = tripService.getById("trip_2310");
    assert.equal(after?.bookedSeats, before ? before.bookedSeats - 1 : -1);
  });
});

describe("trip invariants", () => {
  it("rejects driver overlap, vehicle overlap, breaks, duty, and invalid status changes", () => {
    const overlap = tripService.saveTrip({
      routeId: "route_r01",
      driverId: "driver_rahul",
      vehicleId: "vehicle_03",
      serviceDate: "2026-09-24",
      departureTime: "07:40",
    });
    const vehicleOverlap = tripService.saveTrip({
      routeId: "route_r06",
      driverId: "driver_arjun",
      vehicleId: "vehicle_01",
      serviceDate: "2026-09-24",
      departureTime: "07:40",
    });
    const duringBreak = tripService.saveTrip({
      routeId: "route_r06",
      driverId: "driver_rahul",
      vehicleId: "vehicle_03",
      serviceDate: "2026-09-24",
      departureTime: "12:10",
    });
    const outside = tripService.saveTrip({
      routeId: "route_r01",
      driverId: "driver_rahul",
      vehicleId: "vehicle_03",
      serviceDate: "2026-09-24",
      departureTime: "17:00",
    });
    const reverse = tripService.setTripStatus("trip_2201", "scheduled");
    const editCompleted = tripService.saveTrip({
      id: "trip_2201",
      routeId: "route_r01",
      driverId: "driver_rahul",
      vehicleId: "vehicle_01",
      serviceDate: "2026-09-22",
      departureTime: "07:30",
    });
    assert.equal(overlap.ok ? "" : overlap.errors[0]?.code, "DRIVER_TRIP_OVERLAP");
    assert.equal(vehicleOverlap.ok ? "" : vehicleOverlap.errors[0]?.code, "VEHICLE_TRIP_OVERLAP");
    assert.equal(duringBreak.ok ? "" : duringBreak.errors[0]?.code, "TRIP_DURING_BREAK");
    assert.equal(outside.ok ? "" : outside.errors[0]?.code, "DRIVER_SCHEDULE_CONFLICT");
    assert.equal(reverse.ok ? "" : reverse.errors[0]?.code, "TRIP_STATUS");
    assert.equal(editCompleted.ok ? "" : editCompleted.errors[0]?.code, "NOT_ALLOWED");
  });

  it("rejects a vehicle whose capacity is below occupied seats", () => {
    const ids: string[] = [];
    try {
      for (let index = 0; index < 21; index += 1) {
        const id = `test_cap_${index}`;
        ids.push(id);
        bookingRepository.create({
          id,
          userId: "STU2026018",
          tripId: "trip_2310",
          pickupStopId: "stop_main_gate",
          dropoffStopId: "stop_library",
          bookedAt: "2026-09-23T08:00",
          status: "confirmed",
        });
      }
      const result = tripService.saveTrip({
        id: "trip_2310",
        routeId: "route_r01",
        driverId: "driver_ananya",
        vehicleId: "vehicle_04",
        serviceDate: "2026-09-23",
        departureTime: "14:00",
      });
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.errors[0]?.code, "TRIP_CAPACITY_EXCEEDED");
      }
      assert.equal(tripService.getById("trip_2310")?.vehicleId, "vehicle_02");
    } finally {
      for (const id of ids) {
        bookingRepository.delete(id);
      }
    }
  });
});

describe("route and schedule invariants", () => {
  it("rejects duplicate codes and a route with one stop", () => {
    const route = routeService.saveRoute({
      name: "Copy",
      code: "R-01",
      description: "",
      stopIds: ["stop_main_gate", "stop_library"],
      estimatedDurationMinutes: 20,
      active: true,
    });
    const stop = stopService.saveStop({
      name: "Another gate",
      shortName: "MG",
      description: "",
      active: true,
    });
    const created = routeService.saveRoute({
      name: "Short",
      code: "R-77",
      description: "",
      stopIds: ["stop_main_gate", "stop_library"],
      estimatedDurationMinutes: 15,
      active: true,
    });
    const tooShort = created.ok
      ? routeService.saveRoute({ ...created.route, stopIds: ["stop_main_gate"] })
      : created;
    assert.equal(route.ok ? "" : route.errors[0]?.code, "DUPLICATE_CODE");
    assert.equal(stop.ok ? "" : stop.errors[0]?.code, "DUPLICATE_CODE");
    assert.equal(tooShort.ok ? "" : tooShort.errors[0]?.code, "ROUTE_STOP_ORDER");
  });

  it("rejects invalid duty, overlapping breaks, and a duty that misses an existing trip", () => {
    const duty = scheduleService.saveDuty("driver_rahul", "2026-09-24", "16:00", "07:00");
    const outsideBreak = scheduleService.addBreak("driver_rahul", "2026-09-24", "06:00", "06:20", "rest");
    const overlapBreak = scheduleService.addBreak("driver_rahul", "2026-09-24", "12:10", "12:40", "meal");
    const shrink = scheduleService.saveDuty("driver_rahul", "2026-09-24", "10:00", "16:00");
    assert.equal(duty.ok ? "" : duty.errors[0]?.code, "DUTY_TIME_INVALID");
    assert.equal(outsideBreak.ok ? "" : outsideBreak.errors[0]?.code, "BREAK_OUTSIDE_DUTY");
    assert.equal(overlapBreak.ok ? "" : overlapBreak.errors[0]?.code, "BREAK_OVERLAP");
    assert.equal(shrink.ok ? "" : shrink.errors[0]?.code, "DRIVER_SCHEDULE_CONFLICT");
    assert.equal(scheduleService.forDriverOnDate("driver_rahul", "2026-09-24")?.dutyStart, "07:00");
  });
});
