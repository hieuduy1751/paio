"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Timer, Target, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalExpenses: number
  focusSessions: number
  activeQuests: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      // Fetch expenses stats
      const expensesRes = await fetch("/api/expenses/stats")
      const expensesData = await expensesRes.json()
      
      // Fetch quests stats
      const questsRes = await fetch("/api/quests/stats")
      const questsData = await questsRes.json()
      
      // Fetch focus sessions stats
      const focusRes = await fetch("/api/pomodoro/stats")
      const focusData = await focusRes.json()
      
      setStats({
        totalExpenses: expensesData.monthly?.debit || 0,
        focusSessions: focusData.today || 0,
        activeQuests: questsData.todayCompleted || 0,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statData = stats
    ? [
        {
          title: "Total Expenses",
          value: `${new Intl.NumberFormat('vi-VN').format(Math.round(stats.totalExpenses))} ₫`,
          description: "This month",
          icon: Wallet,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        {
          title: "Focus Sessions",
          value: stats.focusSessions.toString(),
          description: "Completed today",
          icon: Timer,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        },
        {
          title: "Active Quests",
          value: stats.activeQuests.toString(),
          description: "In progress",
          icon: Target,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
        {
          title: "Level Progress",
          value: `${Math.round(((user?.current_exp || 0) / (user?.exp_to_next_level || 1)) * 100)}%`,
          description: "To next level",
          icon: TrendingUp,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        },
      ]
    : []

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.username}!</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse mt-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse mt-3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground">Track your progress and level up your life</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Jump into your most common activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              className="w-full p-4 text-left rounded-lg border border-border hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/dashboard/pomodoro'}
            >
              <div className="font-medium">Start Pomodoro Session</div>
              <div className="text-sm text-muted-foreground">25 minutes of focused work</div>
            </button>
            <button 
              className="w-full p-4 text-left rounded-lg border border-border hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/dashboard/expenses'}
            >
              <div className="font-medium">Add Expense</div>
              <div className="text-sm text-muted-foreground">Track your spending</div>
            </button>
            <button 
              className="w-full p-4 text-left rounded-lg border border-border hover:bg-accent transition-colors"
              onClick={() => window.location.href = '/dashboard/quests'}
            >
              <div className="font-medium">View Active Quests</div>
              <div className="text-sm text-muted-foreground">Complete tasks and earn EXP</div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest achievements and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent activity yet. Start completing quests!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}