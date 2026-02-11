import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

import { db } from "../../../../server/db";
import { ratings } from "../../../../server/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number.parseInt(session.user.id, 10);
  if (!Number.isSafeInteger(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const animeId = Number(searchParams.get("animeId"));

  if (!Number.isInteger(animeId)) {
    return NextResponse.json({ error: "Invalid animeId" }, { status: 400 });
  }

  const row = await db.query.ratings.findFirst({
    where: and(eq(ratings.userId, userId), eq(ratings.animeId, animeId)),
  });

  return NextResponse.json({ value: row?.value ?? null });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number.parseInt(session.user.id, 10);
  if (!Number.isSafeInteger(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const animeId = Number(body?.animeId);
  const value = Number(body?.value);

  if (!Number.isInteger(animeId)) {
    return NextResponse.json({ error: "Invalid animeId" }, { status: 400 });
  }

  if (!Number.isInteger(value) || value < 1 || value > 10) {
    return NextResponse.json({ error: "Rating must be 1..10" }, { status: 400 });
  }

  const existing = await db.query.ratings.findFirst({
    where: and(eq(ratings.userId, userId), eq(ratings.animeId, animeId)),
  });

  if (existing) {
    await db.update(ratings).set({ value }).where(eq(ratings.id, existing.id));
  } else {
    await db.insert(ratings).values({ userId, animeId, value });
  }

  return NextResponse.json({ success: true });
}
