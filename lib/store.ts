import { create } from "zustand"

interface User {
  id: number
  username: string
  level: number
  current_exp: number
  exp_to_next_level: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  updateExp: (exp: number) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    set({ user: null })
    window.location.href = "/login"
  },
  updateExp: (exp) =>
    set((state) => {
      if (!state.user) return state

      let newExp = state.user.current_exp + exp
      let newLevel = state.user.level
      let newExpToNext = state.user.exp_to_next_level

      // Level up logic
      while (newExp >= newExpToNext) {
        newExp -= newExpToNext
        newLevel += 1
        newExpToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1))
      }

      return {
        user: {
          ...state.user,
          level: newLevel,
          current_exp: newExp,
          exp_to_next_level: newExpToNext,
        },
      }
    }),
}))

interface Theme {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleTheme: () => void
}

export const useThemeStore = create<Theme>((set) => ({
  theme: "system",
  setTheme: (theme) => {
    set({ theme })
    if (typeof document !== "undefined" && typeof window !== "undefined") {
      // If theme is system, remove the manual class and let CSS media query handle it
      if (theme === "system") {
        document.documentElement.classList.remove("light", "dark")
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark")
      }
    }
  },
  toggleTheme: () =>
    set((state) => {
      let newTheme: "light" | "dark" = "light"
      
      if (state.theme === "system") {
        // If system theme is currently used, check actual system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        newTheme = systemPrefersDark ? "light" : "dark"
      } else if (state.theme === "light") {
        newTheme = "dark"
      } else {
        newTheme = "light"
      }
      
      if (typeof document !== "undefined" && typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark")
      }
      
      return { theme: newTheme }
    }),
}))