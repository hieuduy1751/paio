import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await db().select("*").from("pomodoro_sessions")
      .where({ user_id: Number.parseInt(userId) })
      .orderBy("started_at", "desc")
      .limit(50)

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[v0] Get pomodoro sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { duration_minutes, task_name } = await request.json()

    const [session] = await db().insert({
        user_id: Number.parseInt(userId),
        duration_minutes,
        task_name,
        started_at: new Date().toISOString(),
        completed: false,
      })
      .into("pomodoro_sessions")
      .returning("*")

    return NextResponse.json({ session })
  } catch (error) {
    console.error("[v0] Create pomodoro session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}