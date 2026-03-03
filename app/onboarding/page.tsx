"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { FloatingInput } from "@/components/ui/floating-field";
import { GradientButton } from "@/components/ui/gradient-button";
import { HeroPanel } from "@/components/ui/hero-panel";

const roleItems = [
  { id: "volunteer", label: "Volunteer", desc: "Turun langsung di aksi lapangan" },
  { id: "donatur", label: "Donatur", desc: "Dukung dana, logistik, konsumsi" },
  { id: "partner", label: "Partner", desc: "Ajukan dan monitor request masjid" },
] as const;

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [roles, setRoles] = useState<string[]>(["volunteer"]);
  const [message, setMessage] = useState("");

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  async function save() {
    const res = await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, region, roles }),
    });
    const data = await res.json();
    setMessage(data.message || "Onboarding selesai");
  }

  return (
    <section className="grid gap-5">
      <HeroPanel title="Onboarding & Role Selection" description="Pilih minat utama kamu. Role aktif bisa diganti kapan saja." />

      <GlassCard className="rounded-3xl p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <FloatingInput label="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
          <FloatingInput label="Wilayah" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {roleItems.map((item) => {
            const active = roles.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleRole(item.id)}
                className={`rounded-2xl border p-4 text-left transition ${active ? "border-cyan-200/70 bg-gradient-to-br from-cyan-300/40 to-blue-500/35" : "border-white/25 bg-white/10 hover:bg-white/20"}`}
              >
                <p className="text-base font-bold">{item.label}</p>
                <p className="mt-1 text-xs text-white/80">{item.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <GradientButton onClick={save}>Simpan Onboarding</GradientButton>
          <p className="text-sm text-cyan-100">{message}</p>
        </div>
      </GlassCard>
    </section>
  );
}
