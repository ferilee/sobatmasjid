import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SobatMasjid",
  description: "Aplikasi volunteer, donatur, dan partner untuk aksi bersih masjid",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl gap-4 p-4 text-sm">
            <Link href="/">Login</Link>
            <Link href="/onboarding">Onboarding</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/partner">Partner</Link>
            <Link href="/volunteer">Volunteer</Link>
            <Link href="/donatur">Donatur</Link>
            <Link href="/feed">Feed</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
