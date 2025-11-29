"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Home, Upload, Pill, Heart, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/home", icon: Home, label: "الرئيسية" },
    { href: "/upload", icon: Upload, label: "رفع وصفة" },
    { href: "/medicines", icon: Pill, label: "أدويتي" },
    { href: "/favorites", icon: Heart, label: "المفضلة" },
    { href: "/profile", icon: User, label: "الملف" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-emerald-100 shadow-2xl z-50 rounded-t-3xl">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                isActive ? "text-emerald-600" : "text-muted-foreground hover:text-emerald-500"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
              )}
              <div className={`transition-all duration-300 ${isActive ? "scale-110 -translate-y-1" : ""}`}>
                <div className={`rounded-2xl p-2 transition-all ${isActive ? "bg-emerald-100" : ""}`}>
                  <Icon className={`h-6 w-6 ${isActive ? "fill-emerald-600" : ""}`} />
                </div>
              </div>
              <span className={`text-xs font-semibold mt-1 transition-all ${isActive ? "text-emerald-600" : ""}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
