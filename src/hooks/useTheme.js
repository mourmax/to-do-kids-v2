import { useState } from 'react'

const THEMES = {
  violet: {
    name: "Violet",
    emoji: "🟣",
    bg: "bg-violet-50",
    border: "border-violet-200",
    borderLight: "border-violet-100",
    headerBg: "bg-violet-50/80",
    inputBg: "bg-violet-50/30",
    sidebarHover: "hover:bg-violet-100/80",
    progressBg: "bg-violet-100",
    codeBg: "bg-violet-50",
  },
  sky: {
    name: "Ciel",
    emoji: "🔵",
    bg: "bg-sky-50",
    border: "border-sky-200",
    borderLight: "border-sky-100",
    headerBg: "bg-sky-50/80",
    inputBg: "bg-sky-50/30",
    sidebarHover: "hover:bg-sky-100/80",
    progressBg: "bg-sky-100",
    codeBg: "bg-sky-50",
  },
  emerald: {
    name: "Nature",
    emoji: "🟢",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    borderLight: "border-emerald-100",
    headerBg: "bg-emerald-50/80",
    inputBg: "bg-emerald-50/30",
    sidebarHover: "hover:bg-emerald-100/80",
    progressBg: "bg-emerald-100",
    codeBg: "bg-emerald-50",
  },
  rose: {
    name: "Rose",
    emoji: "🌸",
    bg: "bg-rose-50",
    border: "border-rose-200",
    borderLight: "border-rose-100",
    headerBg: "bg-rose-50/80",
    inputBg: "bg-rose-50/30",
    sidebarHover: "hover:bg-rose-100/80",
    progressBg: "bg-rose-100",
    codeBg: "bg-rose-50",
  },
  amber: {
    name: "Soleil",
    emoji: "🟡",
    bg: "bg-amber-50",
    border: "border-amber-200",
    borderLight: "border-amber-100",
    headerBg: "bg-amber-50/80",
    inputBg: "bg-amber-50/30",
    sidebarHover: "hover:bg-amber-100/80",
    progressBg: "bg-amber-100",
    codeBg: "bg-amber-50",
  },
  indigo: {
    name: "Indigo",
    emoji: "🔷",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    borderLight: "border-indigo-100",
    headerBg: "bg-indigo-50/80",
    inputBg: "bg-indigo-50/30",
    sidebarHover: "hover:bg-indigo-100/80",
    progressBg: "bg-indigo-100",
    codeBg: "bg-indigo-50",
  },
}

export { THEMES }

export function useTheme() {
  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem('todokids-theme') || 'violet'
  )
  const setTheme = (key) => {
    setThemeKey(key)
    localStorage.setItem('todokids-theme', key)
  }
  const theme = THEMES[themeKey] || THEMES.violet
  return { theme, themeKey, setTheme, THEMES }
}
