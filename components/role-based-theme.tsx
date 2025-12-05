'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * مكون يحدد الوضع الافتراضي للـ Dark Mode حسب الدور
 * 
 * الصيدليات (pharmacy): وضع افتراضي داكن (احترافي)
 * المرضى (patient): وضع افتراضي فاتح (مريح)
 * الإداريين (admin): وضع افتراضي داكن (احترافي)
 */
export function RoleBasedTheme() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // تحديد الدور من المسار
    if (pathname?.includes('/pharmacy/')) {
      // الصيدليات: وضع داكن افتراضي
      if (!theme || theme === 'system') {
        setTheme('dark')
      }
    } else if (pathname?.includes('/admin/')) {
      // الإداريين: وضع داكن افتراضي
      if (!theme || theme === 'system') {
        setTheme('dark')
      }
    } else {
      // المرضى: وضع فاتح افتراضي
      if (!theme || theme === 'system') {
        setTheme('light')
      }
    }
  }, [pathname, mounted, theme, setTheme])

  if (!mounted) return null

  return null
}

/**
 * استخدام المكون في Layout:
 * 
 * import { RoleBasedTheme } from '@/components/role-based-theme'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ThemeProvider>
 *           <RoleBasedTheme />
 *           {children}
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */
