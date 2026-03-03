"use client";

import { useState } from "react";

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
    <section className="grid gap-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Onboarding & Role Selection</h1>
      <input className="rounded border p-2" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="rounded border p-2" placeholder="Wilayah" value={region} onChange={(e) => setRegion(e.target.value)} />
      <div className="flex gap-2">
        {[
          ["volunteer", "Volunteer"],
          ["donatur", "Donatur"],
          ["partner", "Partner"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => toggleRole(id)}
            className={`rounded border px-3 py-2 ${roles.includes(id) ? "bg-primary text-white" : "bg-white"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={save}>Simpan</button>
      <p className="text-sm text-slate-600">{message}</p>
    </section>
  );
}
