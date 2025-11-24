"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { AddMoneySourceDialog } from "@/components/add-money-source-dialog"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { format } from "date-fns"

// Currency symbol mapping
const currencySymbols: Record<string, string> = {
  VND: "₫",
  // Add more currencies as needed
}

// Function to get currency symbol
const getCurrencySymbol = (currency: string) => {
  return currencySymbols[currency] || currency
}

interface MoneySource {
  id: number
  name: string
  balance: number
  currency: string
  color: string
}

interface Expense {
  id: number
  type: "credit" | "debit"
  amount: number
  category: string
  description: string
  transaction_date: string
  source_name: string
  source_color: string
}

interface Stats {
  monthly: {
    credit: number
    debit: number
  }
}

export default function ExpensesPage() {
  const [sources, setSources] = useState<MoneySource[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [showSourceDialog, setShowSourceDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)

  const fetchData = async () => {
    try {
      const [sourcesRes, expensesRes, statsRes] = await Promise.all([
        fetch("/api/money-sources"),
        fetch("/api/expenses"),
        fetch("/api/expenses/stats"),
      ])

      if (sourcesRes.ok) {
        const data = await sourcesRes.json()
        setSources(data.sources)
      }

      if (expensesRes.ok) {
        const data = await expensesRes.json()
        setExpenses(data.expenses)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalBalance = sources.reduce((sum, source) => sum + Number.parseFloat(source.balance.toString()), 0)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowSourceDialog(true)} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Source
          </Button>
          <Button onClick={() => setShowExpenseDialog(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <Wallet className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCurrencySymbol("VND")}{totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income This Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{getCurrencySymbol("VND")}{stats?.monthly.credit.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Total credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses This Month</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{getCurrencySymbol("VND")}{stats?.monthly.debit.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">Total debits</p>
          </CardContent>
        </Card>
      </div>

      {/* Money Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Money Sources</CardTitle>
          <CardDescription>Your accounts and wallets</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No money sources yet. Add one to get started!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="p-4 rounded-lg border border-border"
                  style={{ borderLeftWidth: "4px", borderLeftColor: source.color }}
                >
                  <div className="font-medium text-foreground">{source.name}</div>
                  <div className="text-2xl font-bold mt-2">
                    {getCurrencySymbol(source.currency)}{Number.parseInt(source.balance.toString()).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">{source.currency}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Add your first transaction!
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-2 h-12 rounded-full" style={{ backgroundColor: expense.source_color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{expense.category || "Uncategorized"}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {expense.source_name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{expense.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(expense.transaction_date), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${expense.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {expense.type === "credit" ? "+" : "-"}{getCurrencySymbol("VND")}{Number.parseInt(expense.amount.toString()).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddMoneySourceDialog open={showSourceDialog} onOpenChange={setShowSourceDialog} onSuccess={fetchData} />
      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        sources={sources}
        onSuccess={fetchData}
      />
    </div>
  )
}
