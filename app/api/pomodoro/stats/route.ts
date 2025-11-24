import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface SessionStats {
  count: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get last 7 days of data
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const sessions = await db().select(
        db().raw("DATE(started_at) as date"),
        db().raw("COUNT(*) as sessions"),
        db().raw("SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed"),
      )
      .from("pomodoro_sessions")
      .where({ user_id: Number.parseInt(userId) })
      .where("started_at", ">=", sevenDaysAgo)
      .groupBy("date")
      .orderBy("date", "asc")

    const totalSessions = await db().select(db().raw("COUNT(*) as count"))
      .from("pomodoro_sessions")
      .where({ user_id: Number.parseInt(userId), completed: true })
      .first() as SessionStats | undefined

    const todaySessions = await db().select(db().raw("COUNT(*) as count"))
      .from("pomodoro_sessions")
      .where({ user_id: Number.parseInt(userId) })
      .where("started_at", ">=", new Date().toISOString().split("T")[0])
      .first() as SessionStats | undefined

    return NextResponse.json({
      chart: sessions,
      total: Number.parseInt(totalSessions?.count || "0"),
      today: Number.parseInt(todaySessions?.count || "0"),
    })
  } catch (error) {
    console.error("[v0] Get pomodoro stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}