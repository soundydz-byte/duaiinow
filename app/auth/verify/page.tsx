import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4">
            <img src="/images/logo.png" alt="دوائي" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">دوائي</h1>
        </div>

        <Card className="shadow-lg border-2">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">تحقق من بريدك الإلكتروني</CardTitle>
            <CardDescription className="text-base">لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-center space-y-2">
              <p>يرجى فتح بريدك الإلكتروني والنقر على رابط التفعيل لإكمال عملية التسجيل</p>
              <p className="text-muted-foreground text-xs">إذا لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها</p>
            </div>

            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/login">
                العودة لتسجيل الدخول
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
