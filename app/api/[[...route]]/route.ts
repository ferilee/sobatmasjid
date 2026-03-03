import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import {
  activityFeed,
  contributions,
  eventReports,
  events,
  mosques,
  userRoles,
  users,
  volunteersOnEvent,
} from "@/db/schema";
import { db } from "@/lib/db";
import {
  getSessionUserFromCookie,
  makeCookie,
  requestOtp,
  verifyOtpAndCreateSession,
} from "@/lib/auth";
import { haversineKm } from "@/lib/geo";

type AppUser = typeof users.$inferSelect;
const app = new Hono<{ Variables: { user: AppUser } }>().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.post(
  "/auth/request-otp",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      name: z.string().min(2).max(120).optional(),
    }),
  ),
  async (c) => {
    const { email } = c.req.valid("json");
    const code = await requestOtp(email.toLowerCase());

    return c.json({
      message: "OTP berhasil dikirim ke email.",
      devOtp: process.env.NODE_ENV === "production" ? undefined : code,
    });
  },
);

app.post(
  "/auth/verify-otp",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      code: z.string().length(6),
    }),
  ),
  async (c) => {
    const { email, code } = c.req.valid("json");
    const result = await verifyOtpAndCreateSession(email.toLowerCase(), code);
    if (!result)
      return c.json({ message: "OTP tidak valid atau kadaluarsa." }, 400);

    c.header("Set-Cookie", makeCookie(result.plainToken, result.expiresAt));
    return c.json({ message: "Login berhasil.", user: result.user });
  },
);

app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth") || c.req.path === "/api/health") {
    await next();
    return;
  }

  const user = await getSessionUserFromCookie(c.req.header("cookie"));
  if (!user) return c.json({ message: "Unauthorized" }, 401);

  c.set("user", user);
  await next();
});

app.get("/me", async (c) => {
  const user = c.get("user");
  const roles = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));
  return c.json({ user, roles: roles.map((r) => r.role) });
});

app.put(
  "/onboarding",
  zValidator(
    "json",
    z.object({
      name: z.string().min(2).max(120),
      region: z.string().min(2).max(120),
      roles: z.array(z.enum(["volunteer", "donatur", "partner"])).min(1),
      activeRole: z.enum(["volunteer", "donatur", "partner"]).optional(),
    }),
  ),
  async (c) => {
    const me = c.get("user");
    const payload = c.req.valid("json");

    await db
      .update(users)
      .set({
        name: payload.name,
        region: payload.region,
        isOnboarded: 1,
        activeRole: payload.activeRole || payload.roles[0],
        primaryRole: payload.roles[0],
      })
      .where(eq(users.id, me.id));

    await db.delete(userRoles).where(eq(userRoles.userId, me.id));
    await db
      .insert(userRoles)
      .values(payload.roles.map((role) => ({ userId: me.id, role })));

    return c.json({ message: "Onboarding tersimpan." });
  },
);

app.post(
  "/roles/active",
  zValidator(
    "json",
    z.object({ role: z.enum(["volunteer", "donatur", "partner"]) }),
  ),
  async (c) => {
    const me = c.get("user");
    const { role } = c.req.valid("json");

    const hasRole = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, me.id), eq(userRoles.role, role)),
    });
    if (!hasRole) return c.json({ message: "Role belum dimiliki user." }, 400);

    await db.update(users).set({ activeRole: role }).where(eq(users.id, me.id));
    return c.json({ message: "Role aktif diperbarui." });
  },
);

app.post(
  "/partner/requests",
  zValidator(
    "json",
    z.object({
      mosqueName: z.string().min(3),
      address: z.string().min(5),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      managerName: z.string().min(2),
      managerContact: z.string().min(6),
      scheduledAt: z.string(),
      description: z.string().max(1000).optional(),
      volunteerQuota: z.number().int().min(1).max(1000).optional(),
      conditionPhotoUrl: z.string().url().optional(),
    }),
  ),
  async (c) => {
    const me = c.get("user");
    const payload = c.req.valid("json");

    const [mosque] = await db
      .insert(mosques)
      .values({
        name: payload.mosqueName,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        managerName: payload.managerName,
        managerContact: payload.managerContact,
        conditionPhotoUrl: payload.conditionPhotoUrl || null,
        createdByUserId: me.id,
      })
      .$returningId();

    const [event] = await db
      .insert(events)
      .values({
        mosqueId: mosque.id,
        partnerUserId: me.id,
        title: `Aksi Bersih ${payload.mosqueName}`,
        description: payload.description || null,
        status: "pending_verification",
        scheduledAt: new Date(payload.scheduledAt),
        volunteerQuota: payload.volunteerQuota || 20,
      })
      .$returningId();

    return c.json({
      message: "Request cleansing berhasil dibuat.",
      eventId: event.id,
    });
  },
);

app.get("/partner/requests", async (c) => {
  const me = c.get("user");
  const data = await db.query.events.findMany({
    where: eq(events.partnerUserId, me.id),
    with: { mosque: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
  return c.json({ events: data });
});

app.patch(
  "/events/:id/status",
  zValidator(
    "json",
    z.object({
      status: z.enum([
        "pending_verification",
        "open_recruitment",
        "active",
        "done",
        "cancelled",
      ]),
    }),
  ),
  async (c) => {
    const id = Number(c.req.param("id"));
    const { status } = c.req.valid("json");
    await db.update(events).set({ status }).where(eq(events.id, id));
    return c.json({ message: "Status event diperbarui." });
  },
);

app.get(
  "/volunteer/events/nearby",
  zValidator(
    "query",
    z.object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
      radiusKm: z.coerce.number().min(1).max(200).default(50),
    }),
  ),
  async (c) => {
    const { lat, lng, radiusKm } = c.req.valid("query");

    const rows = await db.query.events.findMany({
      where: inArray(events.status, ["open_recruitment", "active"]),
      with: {
        mosque: true,
        chatLinks: true,
      },
      orderBy: (table, { asc }) => [asc(table.scheduledAt)],
    });

    const filtered = rows
      .map((item) => ({
        ...item,
        distanceKm: haversineKm(
          lat,
          lng,
          item.mosque.latitude,
          item.mosque.longitude,
        ),
      }))
      .filter((item) => item.distanceKm <= radiusKm);

    return c.json({ events: filtered });
  },
);

app.post("/volunteer/events/:id/join", async (c) => {
  const me = c.get("user");
  const id = Number(c.req.param("id"));

  await db
    .insert(volunteersOnEvent)
    .values({ eventId: id, userId: me.id })
    .onDuplicateKeyUpdate({
      set: { status: "joined" },
    });

  return c.json({ message: "Volunteer berhasil tergabung ke aksi." });
});

app.get("/donations/events", async (c) => {
  const list = await db.query.events.findMany({
    where: inArray(events.status, ["open_recruitment", "active"]),
    with: { mosque: true },
    orderBy: (table, { asc }) => [asc(table.scheduledAt)],
  });
  return c.json({ events: list });
});

app.post(
  "/donations",
  zValidator(
    "json",
    z.object({
      eventId: z.number().int().positive(),
      type: z.enum(["uang", "logistik", "konsumsi"]),
      amountMoney: z.number().int().positive().optional(),
      itemName: z.string().max(120).optional(),
      itemQty: z.number().int().positive().optional(),
      note: z.string().max(1000).optional(),
    }),
  ),
  async (c) => {
    const me = c.get("user");
    const payload = c.req.valid("json");

    await db.insert(contributions).values({
      eventId: payload.eventId,
      userId: me.id,
      type: payload.type,
      amountMoney: payload.amountMoney,
      itemName: payload.itemName,
      itemQty: payload.itemQty,
      note: payload.note,
      status: "pledged",
    });

    return c.json({ message: "Kontribusi donatur tercatat." });
  },
);

app.get("/donations/mine", async (c) => {
  const me = c.get("user");
  const list = await db.query.contributions.findMany({
    where: eq(contributions.userId, me.id),
    with: { event: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
  return c.json({ items: list });
});

app.post(
  "/events/:id/report",
  zValidator(
    "json",
    z.object({
      summary: z.string().min(20).max(4000),
      photos: z.array(z.string().url()).default([]),
      publishToFeed: z.boolean().default(true),
      nextStatus: z.enum(["active", "done"]).default("done"),
    }),
  ),
  async (c) => {
    const me = c.get("user");
    const id = Number(c.req.param("id"));
    const payload = c.req.valid("json");

    const [report] = await db
      .insert(eventReports)
      .values({
        eventId: id,
        summary: payload.summary,
        photos: payload.photos,
        createdByUserId: me.id,
      })
      .$returningId();

    await db
      .update(events)
      .set({ status: payload.nextStatus })
      .where(eq(events.id, id));

    if (payload.nextStatus === "done") {
      const joined = await db.query.volunteersOnEvent.findMany({
        where: eq(volunteersOnEvent.eventId, id),
      });

      for (const item of joined) {
        await db
          .update(volunteersOnEvent)
          .set({ xpAwarded: 25, status: "completed" })
          .where(
            and(
              eq(volunteersOnEvent.eventId, id),
              eq(volunteersOnEvent.userId, item.userId),
            ),
          );

        await db
          .update(users)
          .set({
            xp: sql`${users.xp} + 25`,
            badgeLevel: sql`greatest(1, floor((${users.xp} + 25) / 100) + 1)`,
          })
          .where(eq(users.id, item.userId));
      }
    }

    if (payload.publishToFeed) {
      await db.insert(activityFeed).values({
        eventId: id,
        reportId: report.id,
        type: "report_published",
        message:
          "Aksi bersih masjid selesai. Laporan dokumentasi sudah terbit.",
        imageUrl: payload.photos[0] || null,
      });
    }

    return c.json({ message: "Laporan aksi tersimpan." });
  },
);

app.get("/events/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
    with: {
      mosque: true,
      volunteers: true,
      contributions: true,
      reports: true,
      chatLinks: true,
    },
  });

  if (!event) return c.json({ message: "Event tidak ditemukan" }, 404);
  return c.json({ event });
});

app.get("/feed", async (c) => {
  const items = await db.query.activityFeed.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 50,
  });
  return c.json({ items });
});

app.get("/dashboard/stats", async (c) => {
  const [mosquesCount] = await db.select({ count: count() }).from(mosques);
  const [volunteersCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.activeRole, "volunteer"));
  const [openEventsCount] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "open_recruitment"));
  const [doneEventsCount] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "done"));

  return c.json({
    totalMosques: Number(mosquesCount.count),
    totalVolunteers: Number(volunteersCount.count),
    openEvents: Number(openEventsCount.count),
    doneEvents: Number(doneEventsCount.count),
  });
});

app.onError((error, c) => {
  console.error(error);
  return c.json(
    { message: error instanceof Error ? error.message : "Unknown error" },
    500,
  );
});

const handler = handle(app);
export const runtime = "nodejs";
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
