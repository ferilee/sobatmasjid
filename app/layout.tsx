import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "SobatMasjid",
  description:
    "Aplikasi volunteer, donatur, dan partner untuk aksi bersih masjid",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} min-h-screen`}>
        <header className="border-b border-white/30 bg-slate-950/35 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl flex-wrap gap-4 p-4 text-sm text-white">
            <Link className="font-medium hover:text-cyan-200" href="/">
              Login
            </Link>
            <Link
              className="font-medium hover:text-cyan-200"
              href="/onboarding"
            >
              Onboarding
            </Link>
            <Link className="font-medium hover:text-cyan-200" href="/dashboard">
              Dashboard
            </Link>
            <Link className="font-medium hover:text-cyan-200" href="/partner">
              Partner
            </Link>
            <Link className="font-medium hover:text-cyan-200" href="/volunteer">
              Volunteer
            </Link>
            <Link className="font-medium hover:text-cyan-200" href="/donatur">
              Donatur
            </Link>
            <Link className="font-medium hover:text-cyan-200" href="/feed">
              Feed
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </body>
    </html>
  );
}
