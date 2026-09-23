import type { Metadata } from "next";

import { BookShuttleFlow } from "@/features/booking-flow/book-shuttle-flow";

export const metadata: Metadata = {
  title: "Book Shuttle",
  description: "Find and reserve a campus shuttle.",
};

export default function BookShuttlePage() {
  return <BookShuttleFlow />;
}
