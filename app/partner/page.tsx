"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-field";
import { GradientButton } from "@/components/ui/gradient-button";
import { HeroPanel } from "@/components/ui/hero-panel";

export default function PartnerPage() {
  const [form, setForm] = useState({
    mosqueName: "",
    address: "",
    latitude: "",
    longitude: "",
    managerName: "",
    managerContact: "",
    scheduledAt: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  async function submit() {
    const res = await fetch("/api/partner/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      }),
    });
    const data = await res.json();
    setMessage(data.message || "Request dibuat");
  }

  return (
    <section className="grid gap-5">
      <HeroPanel title="Request Cleansing (Partner)" description="Ajukan pembersihan masjid lengkap dengan lokasi, jadwal, dan PIC." />

      <GlassCard className="rounded-3xl p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <FloatingInput label="Nama Masjid" value={form.mosqueName} onChange={(e) => setForm((prev) => ({ ...prev, mosqueName: e.target.value }))} />
          <FloatingInput label="Alamat" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          <FloatingInput label="Latitude" type="number" value={form.latitude} onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))} />
          <FloatingInput label="Longitude" type="number" value={form.longitude} onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))} />
          <FloatingInput label="Nama Penanggung Jawab" value={form.managerName} onChange={(e) => setForm((prev) => ({ ...prev, managerName: e.target.value }))} />
          <FloatingInput label="Kontak Penanggung Jawab" value={form.managerContact} onChange={(e) => setForm((prev) => ({ ...prev, managerContact: e.target.value }))} />
          <FloatingInput label="Jadwal Aksi" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))} />
        </div>

        <FloatingTextarea
          className="mt-3"
          label="Deskripsi Kondisi"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <GradientButton onClick={submit}>Kirim Request</GradientButton>
          <p className="text-sm text-cyan-100">{message}</p>
        </div>
      </GlassCard>
    </section>
  );
}
