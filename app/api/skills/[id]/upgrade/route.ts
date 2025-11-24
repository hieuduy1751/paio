import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface User {
  id: number
  current_exp: number
}

interface UserSkill {
  id: number
  level: number
  exp_multiplier: number
}

const UPGRADE_COST_BASE = 100
const MULTIPLIER_INCREASE = 0.1

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db().select("*")
      .from("users")
      .where({ id: Number.parseInt(userId) })
      .first() as User | undefined

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get or create user skill
    const userSkill = await db().select("*")
      .from("user_skills")
      .where({ user_id: Number.parseInt(userId), skill_id: Number.parseInt(params.id) })
      .first() as UserSkill | undefined

    const currentLevel = userSkill?.level || 0
    const upgradeCost = Math.floor(UPGRADE_COST_BASE * Math.pow(1.5, currentLevel))

    if (user.current_exp < upgradeCost) {
      return NextResponse.json({ error: `Not enough EXP! Need ${upgradeCost} EXP to upgrade.` }, { status: 400 })
    }

    await db().transaction(async (trx) => {
      // Deduct EXP
      await trx("users")
        .where({ id: Number.parseInt(userId) })
        .decrement("current_exp", upgradeCost)

      // Upgrade skill
      if (userSkill) {
        await trx("user_skills")
          .where({ id: userSkill.id })
          .update({
            level: currentLevel + 1,
            exp_multiplier: Number.parseFloat((userSkill.exp_multiplier + MULTIPLIER_INCREASE).toFixed(2)),
          })
      } else {
        await trx("user_skills").insert({
          user_id: Number.parseInt(userId),
          skill_id: Number.parseInt(params.id),
          level: 1,
          exp_multiplier: 1.0 + MULTIPLIER_INCREASE,
        })
      }
    })

    return NextResponse.json({ success: true, cost: upgradeCost })
  } catch (error) {
    console.error("[v0] Upgrade skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}