import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sources = await db().select("*").from("money_sources")
      .where({ user_id: Number.parseInt(userId) })
      .orderBy("created_at", "desc")

    return NextResponse.json({ sources })
  } catch (error) {
    console.error("[v0] Get money sources error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, balance, currency, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const [source] = await db().insert({
        user_id: Number.parseInt(userId),
        name,
        balance: balance || 0,
        currency: currency || "VND",
        color: color || "#3b82f6",
      })
      .into("money_sources")
      .returning("*")

    return NextResponse.json({ source })
  } catch (error) {
    console.error("[v0] Create money source error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}