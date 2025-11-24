import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Get all quests with user progress for today
    const quests = await db().select(
        "quests.*",
        "skills.name as skill_name",
        "skills.icon as skill_icon",
        "user_quests.id as user_quest_id",
        "user_quests.is_active",
        "user_quests.started_at",
        "user_quests.completed_at",
        "user_quests.earned_exp",
      )
      .from("quests")
      .leftJoin("user_quests", function () {
        this.on("quests.id", "=", "user_quests.quest_id")
          .andOn("user_quests.user_id", "=", db().raw("?", [Number.parseInt(userId)]))
          .andOn("user_quests.quest_date", "=", db().raw("?", [today]))
      })
      .leftJoin("skills", "quests.skill_id", "skills.id")

    return NextResponse.json({ quests })
  } catch (error) {
    console.error("[v0] Get quests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}