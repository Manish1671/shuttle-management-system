import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Book Shuttle",
  description: "Book a seat on a campus shuttle.",
};

export default function BookShuttlePage() {
  return (
    <PlaceholderPage
      title="Book Shuttle"
      description="Search a route and reserve a seat on a campus shuttle."
    />
  );
}
