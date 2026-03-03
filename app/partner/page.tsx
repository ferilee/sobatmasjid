"use client";

import { useState } from "react";

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
    <section className="grid gap-3 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Request Cleansing (Partner)</h1>
      {Object.entries(form).map(([key, value]) => (
        <input
          key={key}
          className="rounded border p-2"
          placeholder={key}
          value={value}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        />
      ))}
      <button onClick={submit} className="rounded bg-primary px-4 py-2 text-white">Kirim Request</button>
      <p className="text-sm text-slate-600">{message}</p>
    </section>
  );
}
