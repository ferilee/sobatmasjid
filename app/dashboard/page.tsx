"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalMosques: number;
  totalVolunteers: number;
  openEvents: number;
  doneEvents: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => null);
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats).catch(() => null);
  }, []);

  return (
    <section className="grid gap-4">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Interactive Dashboard</h1>
        <p className="text-sm text-slate-600">Role aktif: {me?.user?.activeRole || "-"}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Masjid Terdaftar" value={stats?.totalMosques} />
        <Card title="Volunteer Aktif" value={stats?.totalVolunteers} />
        <Card title="Aksi Dibuka" value={stats?.openEvents} />
        <Card title="Aksi Selesai" value={stats?.doneEvents} />
      </div>
    </section>
  );
}

function Card({ title, value }: { title: string; value?: number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold">{value ?? 0}</p>
    </div>
  );
}
