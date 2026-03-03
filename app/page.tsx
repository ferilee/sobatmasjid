"use client";

import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function requestOtp() {
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || "OTP dikirim");
  }

  async function verifyOtp() {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp }),
    });
    const data = await res.json();
    setMessage(data.message || "Login berhasil");
  }

  return (
    <section className="grid gap-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">SobatMasjid - Email OTP Login</h1>
      <input className="rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={requestOtp} className="rounded bg-primary px-4 py-2 text-white">Kirim OTP</button>
      <input className="rounded border p-2" placeholder="Kode OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOtp} className="rounded bg-accent px-4 py-2 text-white">Verifikasi OTP</button>
      <p className="text-sm text-slate-600">{message}</p>
    </section>
  );
}
