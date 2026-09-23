import { Button } from "@/components/ui/button";

import type { RouteViewModel } from "./route-types";

export function RouteTable({
  routes,
  onView,
}: {
  routes: RouteViewModel[];
  onView: (routeId: string) => void;
}) {
  return (
    <>
      <div className="hidden min-w-0 max-w-full overflow-x-auto md:block">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">Campus shuttle routes</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="px-2 py-2 font-medium">Route</th>
              <th scope="col" className="px-2 py-2 font-medium">Stops</th>
              <th scope="col" className="px-2 py-2 font-medium">Active</th>
              <th scope="col" className="px-2 py-2 font-medium">Today</th>
              <th scope="col" className="px-2 py-2 font-medium">Upcoming</th>
              <th scope="col" className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((view) => (
              <tr key={view.route.id} className="border-b border-border last:border-0">
                <td className="px-2 py-3">
                  <span className="font-medium">{view.route.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{view.route.code}</span>
                </td>
                <td className="px-2 py-3">{view.stops.length}</td>
                <td className="px-2 py-3">{view.route.active ? "Active" : "Inactive"}</td>
                <td className="px-2 py-3">{view.todayTrips}</td>
                <td className="px-2 py-3">{view.upcomingTrips}</td>
                <td className="px-2 py-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => onView(view.route.id)}>
                    View {view.route.code}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {routes.map((view) => (
          <li key={view.route.id} className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">{view.route.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{view.route.code}</p>
            <p className="mt-2 text-sm">
              {view.stops.length} stops · {view.route.active ? "Active" : "Inactive"}
            </p>
            <p className="text-sm text-muted-foreground">
              {view.todayTrips} today · {view.upcomingTrips} upcoming
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onView(view.route.id)}>
              View {view.route.code}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
