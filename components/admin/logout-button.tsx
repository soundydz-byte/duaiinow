"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_login_time")
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <Button
      onClick={handleLogout}
      className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3"
      title="تسجيل الخروج"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  )
}
