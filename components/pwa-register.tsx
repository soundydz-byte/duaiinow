"use client"

import { useEffect } from "react"
import { usePWARegistration } from "@/hooks/use-pwa"

export function PWARegister() {
  usePWARegistration()
  return null
}
