"use client"

import { Card } from "@/components/ui/card"
import { Building2, User, Sparkles } from "lucide-react"

interface RoleSelectorProps {
  selectedRole: "user" | "pharmacy"
  onRoleChange: (role: "user" | "pharmacy") => void
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card
        className={`p-5 cursor-pointer transition-all duration-300 cute-card rounded-2xl ${
          selectedRole === "user"
            ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-500 border-2 shadow-lg scale-105"
            : "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md"
        }`}
        onClick={() => onRoleChange("user")}
      >
        <div className="flex flex-col items-center gap-2 text-center relative">
          {selectedRole === "user" && (
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-emerald-600 animate-pulse" />
          )}
          <div
            className={`p-3 rounded-2xl transition-all ${
              selectedRole === "user"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
                : "bg-gray-100 text-muted-foreground"
            }`}
          >
            <User className="h-7 w-7" />
          </div>
          <span className={`font-bold text-base ${selectedRole === "user" ? "text-emerald-700" : "text-foreground"}`}>
            مستخدم
          </span>
          <span className="text-xs text-muted-foreground">للأفراد</span>
        </div>
      </Card>

      <Card
        className={`p-5 cursor-pointer transition-all duration-300 cute-card rounded-2xl ${
          selectedRole === "pharmacy"
            ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 border-2 shadow-lg scale-105"
            : "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
        }`}
        onClick={() => onRoleChange("pharmacy")}
      >
        <div className="flex flex-col items-center gap-2 text-center relative">
          {selectedRole === "pharmacy" && (
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-blue-600 animate-pulse" />
          )}
          <div
            className={`p-3 rounded-2xl transition-all ${
              selectedRole === "pharmacy"
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-muted-foreground"
            }`}
          >
            <Building2 className="h-7 w-7" />
          </div>
          <span className={`font-bold text-base ${selectedRole === "pharmacy" ? "text-blue-700" : "text-foreground"}`}>
            صيدلية
          </span>
          <span className="text-xs text-muted-foreground">للصيدليات</span>
        </div>
      </Card>
    </div>
  )
}
