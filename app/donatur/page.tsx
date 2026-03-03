"use client";

import { useEffect, useState } from "react";

export default function DonaturPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventId, setEventId] = useState(0);
  const [type, setType] = useState("uang");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/donations/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        if ((d.events || []).length > 0) setEventId(d.events[0].id);
      });
  }, []);

  async function donate() {
    const payload: any = { eventId, type };
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
    <section className="grid gap-3 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Donatur - Dana, Logistik, Konsumsi</h1>
      <select className="rounded border p-2" value={eventId} onChange={(e) => setEventId(Number(e.target.value))}>
        {events.map((e) => (
          <option value={e.id} key={e.id}>{e.title}</option>
        ))}
      </select>
      <select className="rounded border p-2" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="uang">Dana</option>
        <option value="logistik">Logistik</option>
        <option value="konsumsi">Konsumsi</option>
      </select>
      <input className="rounded border p-2" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nominal atau item" />
      <button className="rounded bg-accent px-4 py-2 text-white" onClick={donate}>Kirim Donasi</button>
      <p className="text-sm text-slate-600">{message}</p>
    </section>
  );
}
