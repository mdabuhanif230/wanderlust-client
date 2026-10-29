"use client"

import { useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Calendar, Eye, Ticket, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { IBooking } from "@/lib/types/booking";
import { useRouter } from "next/navigation";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const MyBookingCard = ({ booking }: { booking: IBooking }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelBooking = async () => {
    setError(null);
    setPending(true);

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/my-bookings/${booking._id}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to cancel the booking.");
      }

      router.push("/my-bookings");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      setPending(false);
    }
  };

  return (
    <Card
      key={booking._id}
      className="overflow-hidden shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative h-50 w-full shrink-0 md:w-75">
          <Image
            height={400}
            width={400}
            src={booking.imageUrl}
            alt={booking.destinationName}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          {/* Top section: Status & Details */}
          <div>
            <h2 className="text-2xl font-medium text-slate-900">
              {booking.destinationName}
            </h2>

            <div className="mt-3 space-y-1.5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Departure: {booking.departureDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                <span>Booking ID: {booking._id}</span>
              </div>
            </div>

            <div className="mt-4 text-2xl font-medium text-blue-500">
              ${booking.price}
            </div>
          </div>

          {/* Bottom section: Action Buttons */}
          <div className="mt-6 flex flex-col items-end gap-2">
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleCancelBooking}
                disabled={pending}
                variant="outline"
                className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <XCircle className="h-4 w-4" />
                {pending ? "Cancelling..." : "Cancel"}
              </Button>
              <Button
                render={
                  <Link href={`/destinations/${booking._id}`} />
                }
                nativeButton={false}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MyBookingCard;
