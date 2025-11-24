"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, TimerIcon, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface Session {
  id: number
  duration_minutes: number
  task_name: string
  started_at: string
  completed: boolean
  completed_at: string | null
}

const QUICK_START_OPTIONS = [
  { name: "Pomodoro", duration: 25 },
  { name: "Short Break", duration: 5 },
  { name: "Long Break", duration: 15 },
  { name: "Deep Focus", duration: 50 },
]

export default function PomodoroPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [taskName, setTaskName] = useState("")
  const [customDuration, setCustomDuration] = useState("25")

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([fetch("/api/pomodoro"), fetch("/api/pomodoro/stats")])

      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(data.sessions)
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

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const startTimer = async (duration: number) => {
    try {
      const response = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_minutes: duration,
          task_name: taskName || "Focus Session",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.session)
        setTimeLeft(duration * 60)
        setIsRunning(true)
        setTaskName("")
      }
    } catch (error) {
      console.error("[v0] Failed to start timer:", error)
    }
  }

  const handleComplete = async () => {
    if (currentSession) {
      try {
        await fetch(`/api/pomodoro/${currentSession.id}/complete`, {
          method: "POST",
        })
        fetchData()
      } catch (error) {
        console.error("[v0] Failed to complete session:", error)
      }
    }
    setIsRunning(false)
    setCurrentSession(null)
    setTimeLeft(0)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setCurrentSession(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = currentSession
    ? ((currentSession.duration_minutes * 60 - timeLeft) / (currentSession.duration_minutes * 60)) * 100
    : 0

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-1">Focus with the Pomodoro technique</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <TimerIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sessions</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Card */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Timer</CardTitle>
            <CardDescription>Start a focus session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="relative">
              <div className="w-full aspect-square max-w-xs mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${progress * 2.827} 282.7`}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-foreground">{formatTime(timeLeft)}</div>
                  {currentSession && (
                    <div className="text-sm text-muted-foreground mt-2">{currentSession.task_name}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isRunning && !currentSession && (
                <>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="taskName">Task Name (Optional)</Label>
                    <Input
                      id="taskName"
                      placeholder="What are you working on?"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {!isRunning && !currentSession && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_START_OPTIONS.map((option) => (
                    <Button key={option.name} variant="outline" onClick={() => startTimer(option.duration)}>
                      <Play className="w-4 h-4 mr-2" />
                      {option.name} ({option.duration}m)
                    </Button>
                  ))}
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="customDuration">Custom Duration (minutes)</Label>
                    <Input
                      id="customDuration"
                      type="number"
                      min="1"
                      max="120"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => startTimer(Number.parseInt(customDuration))}>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                </div>
              </>
            )}

            {currentSession && (
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant={isRunning ? "secondary" : "default"}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetTimer}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="default" onClick={handleComplete}>
                  Complete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days</CardTitle>
              <CardDescription>Your focus sessions over time</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.chart && stats.chart.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), "MMM dd")}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No data yet. Start your first session!</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your latest focus sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No sessions yet</div>
                ) : (
                  sessions.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">{session.task_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(session.started_at), "MMM dd, yyyy h:mm a")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">{session.duration_minutes}m</div>
                        <div
                          className={`text-xs mt-1 ${session.completed ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {session.completed ? "Completed" : "Incomplete"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
