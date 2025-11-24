import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

interface MonthlyStats {
  total_credit: string
  total_debit: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get monthly stats
    const monthlyStats = await db().select(
        db().raw("SUM(CASE WHEN type = ? THEN amount ELSE 0 END) as total_credit", ["credit"]),
        db().raw("SUM(CASE WHEN type = ? THEN amount ELSE 0 END) as total_debit", ["debit"]),
      )
      .from("expenses")
      .where({ user_id: Number.parseInt(userId) })
      .where("transaction_date", ">=", firstDayOfMonth)
      .first() as MonthlyStats | undefined

    // Get category breakdown
    const categoryStats = await db().select("category", "type")
      .sum("amount as total")
      .from("expenses")
      .where({ user_id: Number.parseInt(userId) })
      .where("transaction_date", ">=", firstDayOfMonth)
      .groupBy("category", "type")
      .orderBy("total", "desc")

    return NextResponse.json({
      monthly: {
        credit: Number.parseFloat(monthlyStats?.total_credit || "0"),
        debit: Number.parseFloat(monthlyStats?.total_debit || "0"),
      },
      categories: categoryStats,
    })
  } catch (error) {
    console.error("[v0] Get expense stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}