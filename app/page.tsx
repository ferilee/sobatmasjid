"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { FloatingInput } from "@/components/ui/floating-field";
import { GradientButton } from "@/components/ui/gradient-button";

export default function Page() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });
  const currentParallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion) return;

    const tick = () => {
      currentParallax.current.x +=
        (targetParallax.current.x - currentParallax.current.x) * 0.08;
      currentParallax.current.y +=
        (targetParallax.current.y - currentParallax.current.y) * 0.08;
      setParallax({
        x: currentParallax.current.x,
        y: currentParallax.current.y,
      });
      rafId = window.requestAnimationFrame(tick);
    };

    function handleScroll() {
      if (!coarsePointer) return;
      const normalized = Math.max(-0.5, Math.min(0.5, window.scrollY / 800));
      targetParallax.current.y = normalized;
    }

    rafId = window.requestAnimationFrame(tick);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  function handleHeroMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    targetParallax.current.x = px;
    targetParallax.current.y = py;
  }

  return (
    <section className="relative grid gap-7 pb-4 md:-mt-24">
      <div className="glow-orb -left-12 top-24 h-44 w-44 bg-white/25" />
      <div className="glow-orb right-2 top-12 h-36 w-36 bg-cyan-300/30" />

      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden"
        onMouseMove={handleHeroMove}
        onMouseLeave={() => {
          targetParallax.current.x = 0;
          targetParallax.current.y = 0;
        }}
      >
        <Image
          src="/hero.svg"
          alt="SobatMasjid Hero"
          width={1800}
          height={840}
          priority
          className="h-[340px] w-full object-cover transition-transform duration-300 md:h-[520px]"
          style={{
            transform: `translate3d(${parallax.x * 16}px, ${parallax.y * 16}px, 0) scale(1.08)`,
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-indigo-900/45 to-transparent"
          style={{
            transform: `translate3d(${parallax.x * -8}px, ${parallax.y * -8}px, 0)`,
          }}
        />
        <div
          className="absolute inset-0 flex items-center p-6 md:p-10"
          style={{
            transform: `translate3d(${parallax.x * 10}px, ${parallax.y * 10}px, 0)`,
          }}
        >
          <div className="max-w-xl">
            <p className="mb-3 inline-flex rounded-full border border-white/35 bg-slate-950/35 px-4 py-1 text-xs font-semibold">
              Gerakan Bersih Masjid Indonesia
            </p>
            <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
              Satu Platform
              <br />
              Untuk Aksi Nyata
            </h2>
            <p className="mt-3 text-sm text-white/90 md:text-base">
              Koordinasi volunteer, dukungan donatur, dan request partner dalam
              satu alur transparan.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/onboarding"
                className="rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-300 px-5 py-2 text-sm font-bold text-slate-900"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/feed"
                className="rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold"
              >
                Lihat Dokumentasi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="card-shell relative overflow-hidden rounded-[34px] p-5 md:p-8">
        <div className="glow-orb -left-16 -top-8 h-52 w-52 bg-fuchsia-400/30" />
        <div className="glow-orb right-6 top-8 h-36 w-36 bg-cyan-300/30" />
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              SobatMasjid Platform
            </div>
            <h1 className="max-w-md text-4xl font-extrabold leading-tight md:text-5xl">
              Bersih Masjid
              <br />
              Bareng Komunitas
            </h1>
            <p className="max-w-md text-sm text-white/80 md:text-base">
              Hubungkan Partner, Volunteer, dan Donatur dalam satu alur aksi
              pembersihan masjid yang transparan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-sm font-semibold text-slate-900"
              >
                Lihat Dashboard
              </Link>
              <Link
                href="/feed"
                className="rounded-full border border-white/35 bg-white/10 px-5 py-2 text-sm font-semibold"
              >
                Aktivitas Terbaru
              </Link>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 text-xs md:text-sm">
              <Stat label="Aksi Siap Rekrut" value="Open Recruitment" />
              <Stat label="Dukungan Donatur" value="Dana, Logistik, Konsumsi" />
            </div>
          </div>

          <GlassCard className="rounded-3xl p-4 md:p-5">
            <h2 className="text-lg font-bold">Email OTP Login</h2>
            <p className="mb-4 text-xs text-white/75">
              Masuk cepat tanpa password.
            </p>
            <div className="grid gap-3">
              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <GradientButton onClick={requestOtp} full>
                Kirim OTP
              </GradientButton>
              <FloatingInput
                label="Kode OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={verifyOtp}
                className="rounded-xl border border-white/40 bg-white/20 px-4 py-3 text-sm font-bold"
              >
                Verifikasi OTP
              </button>
            </div>
            <p className="mt-3 min-h-5 text-xs text-cyan-100">{message}</p>
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <FeatureCard
          title="Volunteer"
          text="Aksi terdekat, koordinasi, badge XP."
          color="from-cyan-200/70 to-blue-300/50"
          icon="🧹"
          href="/volunteer"
        />
        <FeatureCard
          title="Donatur"
          text="Dana, logistik, konsumsi saat hari H."
          color="from-pink-200/70 to-fuchsia-300/50"
          icon="💝"
          href="/donatur"
        />
        <FeatureCard
          title="Partner"
          text="Ajukan pembersihan masjid digital."
          color="from-amber-200/70 to-orange-300/50"
          icon="🕌"
          href="/partner"
        />
        <FeatureCard
          title="Onboarding"
          text="Pilih minat utama, switch role kapan saja."
          color="from-lime-200/70 to-emerald-300/50"
          icon="🧭"
          href="/onboarding"
        />
        <FeatureCard
          title="Feed"
          text="Laporan dokumentasi aksi terbaru."
          color="from-violet-200/70 to-indigo-300/50"
          icon="📸"
          href="/feed"
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/25 bg-white/10 p-3">
      <p className="text-[11px] text-white/70">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function FeatureCard({
  title,
  text,
  color,
  icon,
  href,
}: {
  title: string;
  text: string;
  color: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="glass-box rounded-2xl p-3 transition-transform duration-200 hover:-translate-y-1"
    >
      <div
        className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${color}`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs text-white/80">{text}</p>
    </Link>
  );
}
