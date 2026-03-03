"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { HeroPanel } from "@/components/ui/hero-panel";

export default function FeedPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/feed").then((r) => r.json()).then((d) => setItems(d.items || []));
  }, []);

  return (
    <section className="grid gap-5">
      <HeroPanel title="Shared Activity Feed" description="Dokumentasi aksi terbaru untuk menjaga transparansi seluruh pihak." />

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <GlassCard key={item.id} className="overflow-hidden">
            {item.imageUrl ? <div className="mb-3 h-36 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} /> : null}
            <p className="font-semibold">{item.message}</p>
            <p className="mt-1 text-xs text-white/70">{new Date(item.createdAt).toLocaleString("id-ID")}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
