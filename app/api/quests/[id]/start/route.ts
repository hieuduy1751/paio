import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface UserQuest {
  id: number
  completed_at: string | null
  user_id?: number
  quest_id?: number
  quest_date?: string
  is_active?: boolean
  started_at?: string
  earned_exp?: number
  streak_bonus?: number
  completed_streak?: number
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params Promise to get the actual params
    const { id } = await params
    const questId = Number.parseInt(id)
    
    // Validate that questId is a valid number
    if (isNaN(questId)) {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if there's already an active quest
    const activeQuest = await db().select("*")
      .from("user_quests")
      .where({ user_id: Number.parseInt(userId), is_active: true })
      .first() as UserQuest | undefined

    if (activeQuest) {
      return NextResponse.json({ error: "You already have an active quest. Complete it first!" }, { status: 400 })
    }

    // Check if quest already completed today (for limited quests)
    const existingQuests = await db().select("*")
      .from("user_quests")
      .where({
        user_id: Number.parseInt(userId),
        quest_id: questId,
        quest_date: today,
      })
      .orderBy("id", "desc") // Get the most recent one first

    // Check if any of the quests for today are already completed
    const completedToday = existingQuests.some((q: UserQuest) => q.completed_at !== null)
    
    if (completedToday) {
      // For repeatable quests with limits, check if we've hit the limit
      const questInfo = await db().select("max_daily_completions", "repeatable")
        .from("quests")
        .where({ id: questId })
        .first()
      
      if (questInfo) {
        if (questInfo.max_daily_completions !== null) {
          // Count how many times this quest has been completed today
          const completionCount = existingQuests.filter((q: UserQuest) => q.completed_at !== null).length
          if (completionCount >= questInfo.max_daily_completions) {
            return NextResponse.json({ 
              error: `This quest can only be completed ${questInfo.max_daily_completions} times per day` 
            }, { status: 400 })
          }
        } else if (!questInfo.repeatable) {
          // Non-repeatable quest already completed today
          return NextResponse.json({ error: "Quest already completed today!" }, { status: 400 })
        }
      }
    }

    // Start the quest (use the most recent record or create a new one)
    const mostRecentQuest = existingQuests[0]
    
    if (mostRecentQuest && !mostRecentQuest.completed_at) {
      // Update existing incomplete quest
      await db().update({
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .from("user_quests")
        .where({ id: mostRecentQuest.id })
    } else {
      // Create new quest record
      await db().insert({
          user_id: Number.parseInt(userId),
          quest_id: questId,
          quest_date: today,
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .into("user_quests")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Start quest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}