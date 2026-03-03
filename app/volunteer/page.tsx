"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { HeroPanel } from "@/components/ui/hero-panel";

export default function VolunteerPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/volunteer/events/nearby?lat=-8.13&lng=113.22&radiusKm=80");
    const data = await res.json();
    setEvents(data.events || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function join(eventId: number) {
    const res = await fetch(`/api/volunteer/events/${eventId}/join`, { method: "POST" });
    const data = await res.json();
    setMessage(data.message || "Bergabung");
  }

  return (
    <section className="grid gap-5">
      <HeroPanel title="Volunteer: Daftar Aksi Terdekat" description="Geolocation matchmaking untuk mobilisasi volunteer berdasarkan radius.">
        <p className="text-xs text-cyan-100">{message}</p>
      </HeroPanel>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <GlassCard key={event.id}>
            <div className="mb-3 inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs">{event.status}</div>
            <h2 className="text-lg font-bold">{event.title}</h2>
            <p className="mt-1 text-sm text-white/80">
              {event.mosque.name} • {Math.round(event.distanceKm)} km
            </p>
            <p className="mt-1 break-all text-xs text-white/70">Grup: {event.chatLinks?.[0]?.url || "belum ada"}</p>
            <GradientButton className="mt-4" variant="cyan" onClick={() => join(event.id)}>
              Join Aksi
            </GradientButton>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
