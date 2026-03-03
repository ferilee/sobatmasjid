"use client";

import { useEffect, useState } from "react";

export default function FeedPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/feed").then((r) => r.json()).then((d) => setItems(d.items || []));
  }, []);

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-bold">Shared Activity Feed</h1>
      {items.map((item) => (
        <article key={item.id} className="rounded-xl bg-white p-4 shadow">
          <p className="font-semibold">{item.message}</p>
          <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("id-ID")}</p>
        </article>
      ))}
    </section>
  );
}
