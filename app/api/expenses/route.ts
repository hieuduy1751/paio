import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expenses = await db().select("expenses.*", "money_sources.name as source_name", "money_sources.color as source_color")
      .from("expenses")
      .join("money_sources", "expenses.money_source_id", "money_sources.id")
      .where({ "expenses.user_id": Number.parseInt(userId) })
      .orderBy("transaction_date", "desc")
      .limit(100)

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error("[v0] Get expenses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { money_source_id, type, amount, category, description, transaction_date } = await request.json()

    if (!money_source_id || !type || !amount || !transaction_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Start transaction
    await db().transaction(async (trx) => {
      // Create expense
      await trx.insert({
        user_id: Number.parseInt(userId),
        money_source_id,
        type,
        amount,
        category,
        description,
        transaction_date,
      }).into("expenses")

      // Update money source balance
      const balanceChange = type === "credit" ? Number.parseFloat(amount) : -Number.parseFloat(amount)
      await trx("money_sources").where({ id: money_source_id }).increment("balance", balanceChange)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Create expense error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}