import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewTopicForm } from "./new-topic-form"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewTopicPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/sign-in")

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/community">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" /> Vazgeç
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Yeni Forum Konusu Başlat</CardTitle>
        </CardHeader>
        <CardContent>
          <NewTopicForm />
        </CardContent>
      </Card>
    </div>
  )
}
