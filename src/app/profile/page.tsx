import { Suspense } from "react";
import Link from "next/link";
import { Camera, DollarSign, Globe, MapPin, Pencil, Plane, TrendingUp } from "lucide-react";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTokenFromServer } from "@/lib/getTokenFromServer";
import { IBooking } from "@/lib/types/booking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

type ProfileUser = {
  name?: string | null;
  email?: string;
  image?: string | null;
  createdAt?: Date | string | null;
  location?: string | null;
  nationality?: string | null;
};

const formatMemberSince = (value?: Date | string | null) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

async function Stats({ user }: { user: ProfileUser }) {
  const token = await getTokenFromServer();

  let bookings: IBooking[] = [];
  let failed = false;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/my-bookings/${user.email}`,
      {
        cache: "no-store",
        headers: { authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) bookings = data;
    } else {
      failed = true;
    }
  } catch {
    failed = true;
  }

  const totalBookings = bookings.length;
  const countriesVisited = new Set(
    bookings.map((booking) => booking.country).filter(Boolean),
  ).size;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTrips = bookings.filter((booking) => {
    if (!booking.departureDate) return false;
    const departure = new Date(booking.departureDate);
    return !Number.isNaN(departure.getTime()) && departure >= today;
  }).length;
  const totalSpent = bookings.reduce((sum, booking) => {
    const price = Number(booking.price);
    return sum + (Number.isFinite(price) ? price : 0);
  }, 0);

  const stats = [
    {
      label: "Total Bookings",
      value: String(totalBookings),
      icon: Plane,
      iconClass: "bg-sky-100 text-sky-600",
    },
    {
      label: "Countries Visited",
      value: String(countriesVisited),
      icon: Globe,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Upcoming Trips",
      value: String(upcomingTrips),
      icon: TrendingUp,
      iconClass: "bg-orange-100 text-orange-600",
    },
    {
      label: "Total Spent",
      value: formatMoney(totalSpent),
      icon: DollarSign,
      iconClass: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {failed && (
        <p role="status" className="sm:col-span-2 text-sm text-muted-foreground">
          Travel stats are unavailable right now.
        </p>
      )}
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-start justify-between rounded-lg border border-border bg-card p-5"
        >
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.iconClass}`}
          >
            <stat.icon className="size-5" aria-hidden="true" />
          </span>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div role="status" className="grid gap-4 sm:grid-cols-2">
      <span className="sr-only">Loading travel statistics</span>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-border bg-muted/50"
        />
      ))}
    </div>
  );
}

async function ProfileInfo() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as ProfileUser | undefined;

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">
          Please login to view your profile.
        </p>
        <Link href="/login">
          <Button className="bg-[#00A8E8] text-white hover:bg-[#0095d1]">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  const memberSince = formatMemberSince(user.createdAt);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Left: profile card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar size="lg" className="size-28">
              <AvatarImage
                referrerPolicy="no-referrer"
                src={user.image as string}
                alt={user.name ?? "Profile"}
              />
              <AvatarFallback className="text-xl">
                {user.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            {/* Camera badge opens the edit dialog */}
            <EditProfileDialog
              user={user}
              trigger={
                <>
                  <Camera className="size-4" aria-hidden="true" />
                  <span className="sr-only">Change photo</span>
                </>
              }
              triggerClassName="absolute -right-1 bottom-1 flex size-8 items-center justify-center rounded-full bg-[#00A8E8] p-0 text-white ring-2 ring-card hover:bg-[#0095d1]"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
          {user.location ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {user.location}
            </p>
          ) : null}
        </div>

        <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">{memberSince}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Nationality</dt>
            <dd className="font-medium">{user.nationality || "—"}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <EditProfileDialog
            user={user}
            trigger={
              <>
                <Pencil className="size-4" aria-hidden="true" />
                Edit Profile
              </>
            }
          />
        </div>
      </div>

      {/* Right: travel statistics */}
      <div>
        <h2 className="text-lg font-semibold">Travel Statistics</h2>
        <div className="mt-4">
          <Suspense fallback={<StatsSkeleton />}>
            <Stats user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal tracking-tight">My Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account settings and travel preferences
        </p>
      </div>

      <Suspense
        fallback={
          <div role="status" className="h-96 animate-pulse rounded-lg bg-muted/50">
            <span className="sr-only">Loading profile</span>
          </div>
        }
      >
        <ProfileInfo />
      </Suspense>
    </div>
  );
}
