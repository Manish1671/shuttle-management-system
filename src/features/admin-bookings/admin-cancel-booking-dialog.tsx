"use client";

import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";

export function AdminCancelBookingDialog({
  bookingId,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: {
  bookingId: string | null;
  pending: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open={bookingId !== null} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-card outline-none">
          <Dialog.Title className="text-lg font-semibold">Cancel booking {bookingId}?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            Are you sure you want to cancel this shuttle booking? The assigned seat will be released.
          </Dialog.Description>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" className="h-11" disabled={pending}>
                Keep booking
              </Button>
            </Dialog.Close>
            <Button type="button" variant="destructive" className="h-11" disabled={pending} onClick={onConfirm}>
              {pending ? "Cancelling booking..." : "Cancel booking"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
