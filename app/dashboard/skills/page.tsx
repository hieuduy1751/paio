"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import { ChevronUp, Trophy, Book, Droplets, Utensils, Home, Timer } from "lucide-react"

interface Skill {
  id: number
  name: string
  description: string
  icon: string
  base_exp_reward: number
  user_skill_id: number | null
  user_level: number | null
  exp_multiplier: number | null
  completions: number
}

// Map skill icons to actual Lucide components
const skillIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Book,
  Shower: Droplets, // Using Droplets as a substitute for Shower
  Utensils,
  Home,
  Timer,
}

const UPGRADE_COST_BASE = 100

export default function SkillsPage() {
  const { user, setUser } = useAuthStore()
  const [skills, setSkills] = useState<Skill[]>([])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/skills")
      if (response.ok) {
        const data = await response.json()
        setSkills(data.skills)
      }

      // Refresh user data
      const userRes = await fetch("/api/auth/me")
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch skills:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpgrade = async (skillId: number) => {
    try {
      const response = await fetch(`/api/skills/${skillId}/upgrade`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Skill upgraded!`, {
          description: `Spent ${data.cost} EXP.`,
        })
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("[v0] Failed to upgrade skill:", error)
      toast.error("Failed to upgrade skill")
    }
  }

  const calculateUpgradeCost = (currentLevel: number) => {
    return Math.floor(UPGRADE_COST_BASE * Math.pow(1.5, currentLevel))
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Skills Tree</h1>
        <p className="text-muted-foreground mt-1">Upgrade your skills to earn more EXP from quests</p>
      </div>

      {/* Current EXP */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Level {user?.level || 1}</h3>
              <p className="text-sm text-muted-foreground">{user?.current_exp || 0} / {user?.exp_to_next_level || 100} EXP</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <Progress 
            value={user ? (user.current_exp / user.exp_to_next_level) * 100 : 0} 
            className="mt-3" 
          />
        </CardContent>
      </Card>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const level = skill.user_level || 0
          const multiplier = skill.exp_multiplier || 1.0
          const upgradeCost = calculateUpgradeCost(level)
          const canAfford = (user?.current_exp || 0) >= upgradeCost
          
          // Get the icon component from our map
          const IconComponent = skillIconMap[skill.icon] || Book

          return (
            <Card key={skill.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{skill.name}</span>
                      {level > 0 && (
                        <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                          Lv {level}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">{skill.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-muted-foreground">Multiplier</div>
                    <div className="font-semibold text-foreground">{multiplier.toFixed(1)}x</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-muted-foreground">Base EXP</div>
                    <div className="font-semibold text-foreground">+{skill.base_exp_reward}</div>
                  </div>
                </div>

                {/* Progress to next level */}
                {level > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress to Level {level + 1}</span>
                      <span>{skill.completions % 10}/10 quests</span>
                    </div>
                    <Progress value={(skill.completions % 10) * 10} />
                  </div>
                )}

                {/* Upgrade Button */}
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(skill.id)}
                  disabled={!canAfford}
                  variant={canAfford ? "default" : "secondary"}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  {canAfford ? `Upgrade to Lv ${level + 1} (${upgradeCost} EXP)` : `Need ${upgradeCost} EXP`}
                </Button>

                {/* Next level preview */}
                <div className="text-xs text-center text-muted-foreground">
                  Next level: {(multiplier + 0.1).toFixed(1)}x multiplier (+
                  {Math.floor(skill.base_exp_reward * (multiplier + 0.1 - 1))} bonus EXP)
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}