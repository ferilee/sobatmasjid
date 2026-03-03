"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { HeroPanel } from "@/components/ui/hero-panel";

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
    <section className="grid gap-5">
      <HeroPanel title="Interactive Dashboard" description={`Role aktif: ${me?.user?.activeRole || "-"}`}>
        <div className="inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs">Transparansi aksi & kontribusi real-time</div>
      </HeroPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Masjid Terdaftar" value={stats?.totalMosques} accent="from-fuchsia-300/60 to-indigo-400/50" />
        <Card title="Volunteer Aktif" value={stats?.totalVolunteers} accent="from-cyan-300/60 to-blue-400/50" />
        <Card title="Aksi Dibuka" value={stats?.openEvents} accent="from-amber-300/60 to-orange-400/50" />
        <Card title="Aksi Selesai" value={stats?.doneEvents} accent="from-lime-300/60 to-emerald-400/50" />
      </div>
    </section>
  );
}

function Card({ title, value, accent }: { title: string; value?: number; accent: string }) {
  return (
    <GlassCard>
      <div className={`mb-3 h-2 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-sm text-white/75">{title}</p>
      <p className="text-3xl font-extrabold">{value ?? 0}</p>
    </GlassCard>
  );
}
