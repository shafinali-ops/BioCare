'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    card: string
    border: string
  }
}

const themes = {
  light: {
    primary: 'from-primary-500 to-primary-700',
    secondary: 'from-primary-400 to-primary-600',
    accent: 'bg-primary-100 text-primary-800',
    background: 'bg-gray-50',
    text: 'text-gray-900',
    card: 'bg-white border-gray-200',
    border: 'border-gray-300',
    button: 'bg-primary-600 hover:bg-primary-700',
    gradient: 'from-primary-50 to-teal-100',
  },
  dark: {
    primary: 'from-gray-800 to-gray-900',
    secondary: 'from-gray-700 to-gray-800',
    accent: 'bg-gray-700 text-gray-100',
    background: 'bg-gray-900',
    text: 'text-gray-100',
    card: 'bg-gray-800 border-gray-700',
    border: 'border-gray-600',
    button: 'bg-primary-600 hover:bg-primary-700',
    gradient: 'from-gray-900 to-gray-800',
  },
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const colors = {
    primary: themes[theme].primary,
    secondary: themes[theme].secondary,
    accent: themes[theme].accent,
    background: themes[theme].background,
    text: themes[theme].text,
    card: themes[theme].card,
    border: themes[theme].border,
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colors }}>
      <div className={`min-h-screen transition-colors duration-300 ${themes[theme].background}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export { themes }
