'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  /**
   * يمكن تخصيص الألوان حسب الدور
   * pharmacy: لون الصيدليات
   * patient: لون المرضى
   */
  variant?: 'pharmacy' | 'patient' | 'admin'
}

export function ThemeToggle({ variant = 'patient' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  // الألوان حسب الدور
  const colorMap = {
    pharmacy: {
      light: 'bg-blue-50 text-blue-900 hover:bg-blue-100',
      dark: 'bg-blue-950 text-blue-100 hover:bg-blue-900',
    },
    patient: {
      light: 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
      dark: 'bg-emerald-950 text-emerald-100 hover:bg-emerald-900',
    },
    admin: {
      light: 'bg-purple-50 text-purple-900 hover:bg-purple-100',
      dark: 'bg-purple-950 text-purple-100 hover:bg-purple-900',
    },
  }

  const currentColor = colorMap[variant]
  const bgColor = isDark ? currentColor.dark : currentColor.light

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`rounded-lg transition-all ${bgColor}`}
      title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">تبديل الوضع الليلي</span>
    </Button>
  )
}
