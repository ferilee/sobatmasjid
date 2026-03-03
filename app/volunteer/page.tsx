"use client";

import { useEffect, useState } from "react";

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
    <section className="grid gap-4">
      <h1 className="text-xl font-bold">Daftar Aksi Terdekat</h1>
      <p className="text-sm text-slate-600">{message}</p>
      {events.map((event) => (
        <div key={event.id} className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold">{event.title}</h2>
          <p className="text-sm">{event.mosque.name} - {Math.round(event.distanceKm)} km</p>
          <p className="text-xs text-slate-500">Grup: {event.chatLinks?.[0]?.url || "belum ada"}</p>
          <button className="mt-2 rounded bg-primary px-3 py-1 text-white" onClick={() => join(event.id)}>Join</button>
        </div>
      ))}
    </section>
  );
}
