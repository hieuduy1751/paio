import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db().update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .from("pomodoro_sessions")
      .where({ id: Number.parseInt(params.id), user_id: Number.parseInt(userId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Complete pomodoro session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}