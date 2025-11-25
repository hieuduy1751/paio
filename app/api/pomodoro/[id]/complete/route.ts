import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params Promise to get the actual params
    const { id } = await params
    const sessionId = Number.parseInt(id)
    
    // Validate that sessionId is a valid number
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }

    await db().update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .from("pomodoro_sessions")
      .where({ id: sessionId, user_id: Number.parseInt(userId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Complete pomodoro session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}