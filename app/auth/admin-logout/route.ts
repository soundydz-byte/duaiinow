import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url))

  response.cookies.set({
    name: "admin_authenticated",
    value: "",
    maxAge: 0,
    path: "/",
  })

  // Also clear localStorage through client-side script
  return response
}
