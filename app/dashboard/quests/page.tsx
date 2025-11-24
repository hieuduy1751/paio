"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import { Target, Trophy, Flame, Clock, CheckCircle2, PlayCircle, Book, Droplets, Utensils, Home, Timer } from "lucide-react"

interface Quest {
  id: number
  name: string
  description: string
  base_exp: number
  duration_minutes: number
  frequency: "daily" | "weekly"
  skill_name: string
  skill_icon: string
  user_quest_id: number | null
  is_active: boolean
  started_at: string | null
  completed_at: string | null
  earned_exp: number | null
  repeatable: boolean
  max_daily_completions: number | null
}

interface Stats {
  todayCompleted: number
  totalCompleted: number
  streak: number
  dailyStreak: number
  totalQuests: number
}

// Map skill icons to actual Lucide components
const skillIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Book,
  Shower: Droplets, // Using Droplets as a substitute for Shower
  Utensils,
  Home,
  Timer,
}

export default function QuestsPage() {
  const { setUser } = useAuthStore()
  const [quests, setQuests] = useState<Quest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchData = async () => {
    try {
      const [questsRes, statsRes] = await Promise.all([fetch("/api/quests"), fetch("/api/quests/stats")])

      if (questsRes.ok) {
        const data = await questsRes.json()
        setQuests(data.quests)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      // Refresh user data
      const userRes = await fetch("/api/auth/me")
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStartQuest = async (questId: number) => {
    try {
      const response = await fetch(`/api/quests/${questId}/start`, {
        method: "POST",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("[v0] Failed to start quest:", error)
    }
  }

  const handleCompleteQuest = async (questId: number) => {
    try {
      const response = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.streakBonus > 0) {
          toast.success(`Quest completed! Earned ${data.earnedExp} EXP`, {
            description: `${data.streakBonus} bonus from ${data.dailyStreak}-day streak`,
          })
        } else {
          toast.success(`Quest completed! Earned ${data.earnedExp} EXP`)
        }
        fetchData()
      }
    } catch (error) {
      console.error("[v0] Failed to complete quest:", error)
      toast.error("Failed to complete quest")
    }
  }

  // Filter quests by frequency
  const dailyQuests = quests.filter((quest) => quest.frequency === "daily")
  const weeklyQuests = quests.filter((quest) => quest.frequency === "weekly")

  // Find active quest
  const activeQuest = quests.find((quest) => quest.is_active) || null

  // Calculate progress percentages
  const dailyStreakProgress = Math.min((stats?.dailyStreak || 0) / 7 * 100, 100) // Assuming 7-day max for display
  const weeklyGoalProgress = Math.min((stats?.todayCompleted || 0) / 10 * 100, 100) // Assuming 10 quests max for display

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Fixed Stats Section */}
      <div className="sticky top-0 z-10 bg-background pb-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quest System</h1>
          <p className="text-muted-foreground mt-1">Complete quests and level up your life</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&#39;s Quests</CardTitle>
              <Target className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayCompleted || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Quests</CardTitle>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalQuests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Streak</CardTitle>
              <Flame className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.dailyStreak || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Day streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bars Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Daily Streak Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Streak Progress</CardTitle>
              <CardDescription>Keep your daily streak going!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{stats?.dailyStreak || 0} days</span>
                <span className="text-sm text-muted-foreground">7 days goal</span>
              </div>
              <Progress value={dailyStreakProgress} />
              <div className="text-xs text-muted-foreground mt-2">
                Complete quests daily to maintain your streak
              </div>
            </CardContent>
          </Card>

          {/* Daily Quests Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Quests Progress</CardTitle>
              <CardDescription>Your daily quest completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{stats?.todayCompleted || 0} quests</span>
                <span className="text-sm text-muted-foreground">10 quests goal</span>
              </div>
              <Progress value={weeklyGoalProgress} />
              <div className="text-xs text-muted-foreground mt-2">
                Complete more quests to earn EXP and level up
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Quests Section */}
      <div className="space-y-6">
        {/* Active Quest */}
        {activeQuest && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-primary" />
                Active Quest
              </CardTitle>
              <CardDescription>You have an active quest in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{activeQuest.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">{activeQuest.skill_name}</span>
                    <span className="text-sm text-muted-foreground">{activeQuest.duration_minutes} minutes</span>
                  </div>
                </div>
                <Button size="lg" onClick={() => handleCompleteQuest(activeQuest.id)} className="ml-4">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Quest
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily and Weekly Quests Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Quests */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Quests</CardTitle>
              <CardDescription>Complete these quests every day</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {dailyQuests.map((quest) => {
                  // Get the icon component from our map
                  const IconComponent = skillIconMap[quest.skill_icon] || Book
                  const isCompleted = quest.completed_at !== null
                  const isActive = quest.is_active

                  return (
                    <div
                      key={quest.id}
                      className={`p-4 rounded-lg border ${
                        isCompleted
                          ? "border-green-500 bg-green-500/5"
                          : isActive
                            ? "border-primary bg-primary/5"
                            : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{quest.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {quest.skill_name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {quest.duration_minutes}m
                            </span>
                            <span className="text-xs font-medium text-primary">+{quest.base_exp} EXP</span>
                            {quest.repeatable && (
                              <Badge variant="secondary" className="text-xs">
                                Repeatable
                              </Badge>
                            )}
                            {quest.max_daily_completions !== null && (
                              <Badge variant="outline" className="text-xs">
                                Max {quest.max_daily_completions}/day
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <Button size="sm" variant="outline" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                              Done
                            </Button>
                          ) : isActive ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Button size="sm" onClick={() => handleStartQuest(quest.id)} disabled={!!activeQuest}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Quests */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Quests</CardTitle>
              <CardDescription>Bigger challenges for more EXP</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {weeklyQuests.map((quest) => {
                  // Get the icon component from our map
                  const IconComponent = skillIconMap[quest.skill_icon] || Book
                  const isCompleted = quest.completed_at !== null
                  const isActive = quest.is_active
                  return (
                    <div
                      key={quest.id}
                      className={`p-4 rounded-lg border ${
                        isCompleted
                          ? "border-green-500 bg-green-500/5"
                          : isActive
                            ? "border-primary bg-primary/5"
                            : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{quest.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {quest.skill_name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {quest.duration_minutes}m
                            </span>
                            <span className="text-xs font-medium text-primary">+{quest.base_exp} EXP</span>
                            {quest.repeatable && (
                              <Badge variant="secondary" className="text-xs">
                                Repeatable
                              </Badge>
                            )}
                            {quest.max_daily_completions !== null && (
                              <Badge variant="outline" className="text-xs">
                                Max {quest.max_daily_completions}/day
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <Button size="sm" variant="outline" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                              Done
                            </Button>
                          ) : isActive ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Button size="sm" onClick={() => handleStartQuest(quest.id)} disabled={!!activeQuest}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}