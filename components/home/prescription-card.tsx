import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Sparkles } from "lucide-react"
import type { Prescription } from "@/lib/types"
import Image from "next/image"

interface PrescriptionCardProps {
  prescription: Prescription & {
    responses_count?: number
  }
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const statusColors = {
    pending: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300",
    responded: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300",
    accepted: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300",
    rejected: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300",
    completed: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300",
  }

  const statusLabels = {
    pending: "قيد الانتظار",
    responded: "تم الرد",
    accepted: "مقبولة",
    rejected: "مرفوضة",
    completed: "مكتملة",
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cute-card border-2 border-emerald-100/50 rounded-2xl bg-gradient-to-br from-white to-emerald-50/20">
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-200 shadow-md">
          <Image 
            src={prescription.images_urls?.[0] || "/placeholder.svg"} 
            alt="وصفة طبية" 
            fill 
            className="object-cover"
            priority={false}
            unoptimized={true}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-base text-emerald-900">وصفة طبية</h3>
            <Badge className={`${statusColors[prescription.status]} text-xs font-semibold border shadow-sm`}>
              {statusLabels[prescription.status]}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{new Date(prescription.created_at).toLocaleDateString("en-US")}</span>
          </div>

          {prescription.responses_count && prescription.responses_count > 0 && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full w-fit">
              <MapPin className="h-3.5 w-3.5" />
              <span>{prescription.responses_count} صيدلية ردت</span>
              <Sparkles className="h-3 w-3" />
            </div>
          )}

          {prescription.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-gray-50 p-2 rounded-lg">
              {prescription.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
