"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "cn";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/add-destination", label: "Add Destination" },
  { href: "/my-bookings", label: "My Bookings" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  const user = session?.user;

  const handleSignout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Left: mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <ul className="flex flex-col gap-4 px-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors hover:text-[#00A8E8]",
                      isActiveLink(pathname, link.href)
                        ? "font-medium text-[#00A8E8]"
                        : "text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {!isPending && !user && (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-foreground transition-colors hover:text-[#00A8E8]"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="text-sm text-foreground transition-colors hover:text-[#00A8E8]"
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
              {!isPending && user && (
                <li>
                  <Link
                    href="/profile"
                    className={cn(
                      "text-sm transition-colors hover:text-[#00A8E8]",
                      pathname === "/profile"
                        ? "font-medium text-[#00A8E8]"
                        : "text-foreground",
                    )}
                  >
                    Profile
                  </Link>
                </li>
              )}
            </ul>
          </SheetContent>
        </Sheet>

        {/* Left: primary links (desktop) */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-[#00A8E8]",
                  isActiveLink(pathname, link.href)
                    ? "border-b-2 border-[#00A8E8] pb-0.5 font-medium text-[#00A8E8]"
                    : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Center: logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-tight text-[#00A8E8] md:text-3xl"
        >
          Wanderlust
        </Link>

        {/* Right: account links */}
        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  "hidden text-sm transition-colors hover:text-[#00A8E8] sm:block",
                  pathname === "/profile"
                    ? "font-medium text-[#00A8E8]"
                    : "text-foreground",
                )}
              >
                Profile
              </Link>
              <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    aria-label="Open account menu"
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                }
              >
                <Avatar>
                  <AvatarImage
                    referrerPolicy="no-referrer"
                    src={user?.image as string}
                  />
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>{user?.name}</PopoverTitle>
                  <PopoverDescription>
                    <span className="block">{user?.email}</span>
                    <Button onClick={handleSignout} variant={"destructive"}>
                      Signout
                    </Button>
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-foreground transition-colors hover:text-[#00A8E8] sm:block"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden text-sm text-foreground transition-colors hover:text-[#00A8E8] sm:block"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
