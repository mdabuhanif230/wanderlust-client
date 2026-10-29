import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MyBookingCard from "@/components/booking/MyBookingCard";
import { IBooking } from "@/lib/types/booking";
import { getTokenFromServer } from "@/lib/getTokenFromServer";
import { Button } from "@/components/ui/button";

async function Bookings() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    return (
      <p role="status" className="py-16 text-center text-muted-foreground">
        Please login to see your bookings.
      </p>
    );
  }

  const token = await getTokenFromServer();

  let bookings: IBooking[];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/my-bookings/${user.email}`,
      {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) throw new Error("Failed to load bookings");
    bookings = await res.json();
    if (!Array.isArray(bookings)) throw new Error("Invalid bookings");
  } catch {
    return (
      <p role="status" className="py-16 text-center text-muted-foreground">
        Your bookings are unavailable right now. Please try again later.
      </p>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">You have no bookings yet.</p>
        <Link href="/destinations">
          <Button
            variant="outline"
            className="border-travel text-travel hover:bg-travel/5 hover:text-travel"
          >
            Explore Destinations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {bookings.map((booking) => {
        return <MyBookingCard booking={booking} key={booking._id} />;
      })}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading your bookings</span>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-50 animate-pulse rounded-md border border-border bg-muted/50"
        />
      ))}
    </div>
  );
}

const MyBookingsPage = async () => {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal tracking-tight">My Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage and view your upcoming travel plans
        </p>
      </div>

      {/* Bookings List */}
      <Suspense fallback={<BookingsSkeleton />}>
        <Bookings />
      </Suspense>
    </div>
  );
};

export default MyBookingsPage;
