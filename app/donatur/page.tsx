"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { FloatingInput, FloatingSelect } from "@/components/ui/floating-field";
import { GradientButton } from "@/components/ui/gradient-button";
import { HeroPanel } from "@/components/ui/hero-panel";

export default function DonaturPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventId, setEventId] = useState("");
  const [type, setType] = useState("uang");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/donations/events")
      .then((r) => r.json())
      .then((d) => {
        const list = d.events || [];
        setEvents(list);
        if (list.length > 0) setEventId(String(list[0].id));
      });
  }, []);

  async function donate() {
    const payload: any = { eventId: Number(eventId), type };
    if (type === "uang") payload.amountMoney = Number(value);
    if (type !== "uang") payload.itemName = value;
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(data.message || "Donasi tercatat");
  }

  return (
    <section className="grid gap-5">
      <HeroPanel title="Donatur: Dana, Logistik, Konsumsi" description="Pilih aksi lalu tentukan bentuk dukungan untuk hari pelaksanaan." />

      <GlassCard className="rounded-3xl p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <FloatingSelect
            label="Pilih Aksi"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            options={events.map((e) => ({ value: String(e.id), label: e.title }))}
          />
          <FloatingSelect
            label="Jenis Donasi"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "uang", label: "Dana" },
              { value: "logistik", label: "Logistik" },
              { value: "konsumsi", label: "Konsumsi" },
            ]}
          />
        </div>

        <FloatingInput className="mt-3" label={type === "uang" ? "Nominal" : "Nama Item"} value={value} onChange={(e) => setValue(e.target.value)} />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <GradientButton variant="amber" onClick={donate}>
            Kirim Donasi
          </GradientButton>
          <p className="text-sm text-cyan-100">{message}</p>
        </div>
      </GlassCard>
    </section>
  );
}
