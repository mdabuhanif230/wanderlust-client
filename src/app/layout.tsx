import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";


const josefinSans = Josefin_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wanderlust | Book Your Next Adventure",
  description:
    "Discover handpicked travel destinations, compare packages and book your next adventure with Wanderlust.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${josefinSans.className}  h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add
          attributes like cz-shortcut-listen to <body> before React hydrates. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
           <Navbar />
        {children}
         <Footer />
        </body>
    </html>
  );
}
