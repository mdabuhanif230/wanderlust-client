"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { IDestination } from "@/lib/types/destinations";
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const perks = [
  "Free cancellation up to 7 days",
  "Travel insurance included",
  "24/7 customer support",
];

const BookingCard = ({ destination }: { destination: IDestination }) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const departureDate = formData.get("departureDate");

      const token = await getTokenFromClient();

      const data = {
        username: user?.name,
        email: user?.email,
        image: user?.image,
        ...destination,
        departureDate,
        bookingDate: new Date(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      const bookingRes = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(bookingRes?.message ?? "Booking failed. Try again.");
      }

      setMessage({
        type: "success",
        text: "Booking confirmed! Taking you to your bookings...",
      });
      router.push("/my-bookings");
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Something went wrong. Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <aside className="h-fit rounded-sm border border-border p-5">
      <p className="text-sm text-muted-foreground">Starting from</p>
      <p className="mt-1 text-3xl font-semibold text-[#00A8E8]">
        ${destination.price}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">per person</p>

      {!user ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Login to book this trip.
          </p>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className="mt-4 w-full bg-[#00A8E8] text-white hover:bg-[#0095d1]"
          >
            Login to Book
            <ArrowRight />
          </Button>
        </>
      ) : (
        <form onSubmit={handleBooking}>
          <Input
            type="date"
            name="departureDate"
            aria-label="Departure date"
            defaultValue={destination.departureDate}
            className="mt-4"
          />

          {message && (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={
                message.type === "error"
                  ? "mt-3 text-sm text-destructive"
                  : "mt-3 text-sm text-green-600"
              }
            >
              {message.text}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="mt-4 w-full bg-[#00A8E8] text-white hover:bg-[#0095d1]"
          >
            {pending ? "Booking..." : "Book Now"}
            <ArrowRight />
          </Button>
        </form>
      )}

      <ul className="mt-5 space-y-3 border-t border-border pt-5">
        {perks.map((perk) => (
          <li
            key={perk}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Check className="size-4 shrink-0 text-green-600" />
            {perk}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default BookingCard;
