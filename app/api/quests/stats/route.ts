import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface CountResult {
  count: string
}

interface CompletionHistory {
  date: string
}

interface User {
  daily_streak: number
  total_quests_completed: number
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Get user info for streak
    const user = await db().select("daily_streak", "total_quests_completed")
      .from("users")
      .where({ id: Number.parseInt(userId) })
      .first() as User | undefined

    // Get today's completed quests
    const todayCompleted = await db().select(db().raw("COUNT(*) as count"))
      .from("user_quests")
      .where({ user_id: Number.parseInt(userId), quest_date: today })
      .whereNotNull("completed_at")
      .first() as CountResult | undefined

    // Get total completed quests
    const totalCompleted = await db().select(db().raw("COUNT(*) as count"))
      .from("user_quests")
      .where({ user_id: Number.parseInt(userId) })
      .whereNotNull("completed_at")
      .first() as CountResult | undefined

    // Get current streak
    const completionHistory = await db().select(db().raw("DATE(quest_date) as date"))
      .from("user_quests")
      .where({ user_id: Number.parseInt(userId) })
      .whereNotNull("completed_at")
      .groupBy("date")
      .orderBy("date", "desc")
      .limit(30) as unknown as CompletionHistory[]

    let streak = 0
    const currentDate = new Date()

    for (const record of completionHistory) {
      const recordDate = new Date(record.date)
      const daysDiff = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }

    return NextResponse.json({
      todayCompleted: Number.parseInt(todayCompleted?.count || "0"),
      totalCompleted: Number.parseInt(totalCompleted?.count || "0"),
      streak,
      dailyStreak: user?.daily_streak || 0,
      totalQuests: user?.total_quests_completed || 0,
    })
  } catch (error) {
    console.error("[v0] Get quest stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}