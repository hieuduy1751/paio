import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface Quest {
  id: number
  skill_id: number
  base_exp: number
  repeatable: boolean
  max_daily_completions: number | null
}

interface UserSkill {
  exp_multiplier: number
}

interface User {
  current_exp: number
  level: number
  exp_to_next_level: number
  daily_streak: number
  last_quest_date: string | null
  total_quests_completed: number
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

    // Get quest and user skill info
    const quest = await db().select("*")
      .from("quests")
      .where({ id: questId })
      .first() as Quest | undefined

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    // Check if quest has daily completion limits
    if (quest.max_daily_completions !== null) {
      // Count how many times this quest has been completed today
      const completionCountResult = await db().count("* as count")
        .from("user_quests")
        .where({
          user_id: Number.parseInt(userId),
          quest_id: questId,
          quest_date: today,
        })
        .whereNotNull("completed_at")
        .first()
      
      // Extract count from the result (Knex returns different structures based on DB)
      let count = 0
      if (completionCountResult) {
        if (typeof completionCountResult === 'object' && 'count' in completionCountResult) {
          count = Number.parseInt((completionCountResult as { count: string }).count || "0")
        } else if (typeof completionCountResult === 'string') {
          count = Number.parseInt(completionCountResult || "0")
        }
      }
      
      if (count >= quest.max_daily_completions) {
        return NextResponse.json({ 
          error: `This quest can only be completed ${quest.max_daily_completions} times per day` 
        }, { status: 400 })
      }
    } else if (!quest.repeatable) {
      // Check if non-repeatable quest was already completed today
      const existingCompletion = await db().select("*")
        .from("user_quests")
        .where({
          user_id: Number.parseInt(userId),
          quest_id: questId,
          quest_date: today,
        })
        .whereNotNull("completed_at")
        .first()
      
      if (existingCompletion) {
        return NextResponse.json({ error: "This quest can only be completed once per day" }, { status: 400 })
      }
    }

    // Get user skill multiplier
    const userSkill = await db().select("*")
      .from("user_skills")
      .where({ user_id: Number.parseInt(userId), skill_id: quest.skill_id })
      .first() as UserSkill | undefined

    // Get user info for streak calculation
    const user = await db().select("*")
      .from("users")
      .where({ id: Number.parseInt(userId) })
      .first() as User | undefined

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const multiplier = userSkill?.exp_multiplier || 1.0
    const baseExp = Math.floor(quest.base_exp * multiplier)
    
    // Calculate streak bonus
    let streakBonus = 0
    let newDailyStreak = user.daily_streak
    let newLastQuestDate = user.last_quest_date
    
    // Check if we should increment the daily streak
    if (!user.last_quest_date || user.last_quest_date < today) {
      // If last quest was yesterday or earlier, increment streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]
      
      if (user.last_quest_date === yesterdayStr) {
        // Consecutive day, increment streak
        newDailyStreak = user.daily_streak + 1
      } else {
        // Break in streak or first quest, reset to 1
        newDailyStreak = 1
      }
      
      newLastQuestDate = today
    }
    
    // Calculate streak bonus (5% bonus per day of streak, capped at 50%)
    if (newDailyStreak > 1) {
      const bonusPercentage = Math.min((newDailyStreak - 1) * 0.05, 0.5) // Max 50% bonus
      streakBonus = Math.floor(baseExp * bonusPercentage)
    }
    
    const earnedExp = baseExp + streakBonus

    // Complete the quest
    await db().transaction(async (trx) => {
      // First, deactivate any currently active quest for this user
      await trx.update({ is_active: false })
        .from("user_quests")
        .where({ user_id: Number.parseInt(userId), is_active: true })

      // For quests with limits or repeatable quests, we insert a new record each time
      // For non-repeatable quests, we update the existing record or insert if it doesn't exist
      
      if (quest.repeatable || quest.max_daily_completions !== null) {
        // Insert a new record for repeatable quests or quests with limits
        await trx.insert({
          user_id: Number.parseInt(userId),
          quest_id: questId,
          quest_date: today,
          is_active: false,
          completed_at: new Date().toISOString(),
          earned_exp: earnedExp,
          streak_bonus: streakBonus,
          completed_streak: 1, // Each completion is a separate streak for repeatable quests
        })
        .into("user_quests")
      } else {
        // For non-repeatable quests, update existing or insert new
        const [userQuest] = await trx.select("*")
          .from("user_quests")
          .where({
            user_id: Number.parseInt(userId),
            quest_id: questId,
            quest_date: today,
          })
          .limit(1)
        
        if (userQuest) {
          // Update existing record
          await trx.update({
            is_active: false,
            completed_at: new Date().toISOString(),
            earned_exp: earnedExp,
            streak_bonus: streakBonus,
            completed_streak: userQuest.completed_streak ? userQuest.completed_streak + 1 : 1,
          })
          .from("user_quests")
          .where({
            user_id: Number.parseInt(userId),
            quest_id: questId,
            quest_date: today,
          })
        } else {
          // Insert new record
          await trx.insert({
            user_id: Number.parseInt(userId),
            quest_id: questId,
            quest_date: today,
            is_active: false,
            completed_at: new Date().toISOString(),
            earned_exp: earnedExp,
            streak_bonus: streakBonus,
            completed_streak: 1,
          })
          .into("user_quests")
        }
      }

      // Update user exp, level, and streak info
      let newExp = user.current_exp + earnedExp
      let newLevel = user.level
      let newExpToNext = user.exp_to_next_level
      const newTotalQuests = user.total_quests_completed + 1

      // Level up logic
      while (newExp >= newExpToNext) {
        newExp -= newExpToNext
        newLevel += 1
        newExpToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1))
      }

      await trx.update({
        level: newLevel,
        current_exp: newExp,
        exp_to_next_level: newExpToNext,
        daily_streak: newDailyStreak,
        last_quest_date: newLastQuestDate,
        total_quests_completed: newTotalQuests,
      })
      .from("users")
      .where({ id: Number.parseInt(userId) })
    })

    return NextResponse.json({ 
      earnedExp, 
      streakBonus,
      dailyStreak: newDailyStreak,
      success: true 
    })
  } catch (error) {
    console.error("[v0] Complete quest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}