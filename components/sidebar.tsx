"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore, useThemeStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LayoutDashboard, Wallet, Timer, Target, TreeDeciduous, LogOut, Sun, Moon, Sword } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
  { name: "Pomodoro", href: "/dashboard/pomodoro", icon: Timer },
  { name: "Quests", href: "/dashboard/quests", icon: Target },
  { name: "Skills Tree", href: "/dashboard/skills", icon: TreeDeciduous },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  if (!user) return null

  const expPercentage = (user.current_exp / user.exp_to_next_level) * 100

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center">
            <Sword className="w-7 h-7 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">PAIO</h1>
            <p className="text-xs text-sidebar-foreground/60">Your Productivity Hub</p>
          </div>
        </div>

        {/* User Level Card */}
        <div className="bg-sidebar-accent rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sidebar-accent-foreground">{user.username}</span>
            <span className="text-xs font-bold text-sidebar-primary px-2 py-1 bg-sidebar-primary/10 rounded-full">
              Lv {user.level}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-sidebar-accent-foreground/70">
              <span>{user.current_exp} EXP</span>
              <span>{user.exp_to_next_level} EXP</span>
            </div>
            <Progress value={expPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {theme === "light" ? (
            <>
              <Moon className="w-5 h-5" />
              <span className="text-sm">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5" />
              <span className="text-sm">Light Mode</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
