import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

interface HomeButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function HomeButton({ variant = "outline", size = "sm", className }: HomeButtonProps) {
  return (
    <Button variant={variant} size={size} asChild className={className}>
      <Link href="/">
        <Home className="h-4 w-4 mr-1" /> Home
      </Link>
    </Button>
  )
}
