import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface Skill {
  id: number
  name: string
  description: string
  icon: string
  base_exp_reward: number
  created_at: string
  updated_at: string
  user_skill_id: number | null
  user_level: number | null
  exp_multiplier: number | null
}

interface QuestStat {
  skill_id: number
  completions: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all skills with user progress
    const skills = await db().select(
        "skills.*",
        "user_skills.id as user_skill_id",
        "user_skills.level as user_level",
        "user_skills.exp_multiplier",
      )
      .from("skills")
      .leftJoin("user_skills", function () {
        this.on("skills.id", "=", "user_skills.skill_id").andOn(
          "user_skills.user_id",
          "=",
          db().raw("?", [Number.parseInt(userId)]),
        )
      })

    // Get quest completion stats per skill
    const questStats = await db().select("quests.skill_id", db().raw("COUNT(*) as completions"))
      .from("user_quests")
      .join("quests", "user_quests.quest_id", "quests.id")
      .where({ "user_quests.user_id": Number.parseInt(userId) })
      .whereNotNull("user_quests.completed_at")
      .groupBy("quests.skill_id")

    const statsMap = new Map(questStats.map((s: QuestStat) => [s.skill_id, Number.parseInt(s.completions)]))

    const skillsWithStats = skills.map((skill: Skill) => ({
      ...skill,
      completions: statsMap.get(skill.id) || 0,
    }))

    return NextResponse.json({ skills: skillsWithStats })
  } catch (error) {
    console.error("[v0] Get skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}