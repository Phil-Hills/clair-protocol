"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
// Import the HomeButton component
import { HomeButton } from "@/components/home-button"

export default function SimpleChatPage() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetch("/api/simple-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      const data = await result.json()

      if (!result.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      setResponse(data.response)
    } catch (err: any) {
      console.error("Error sending message:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-slate-900 to-black text-white">
      <Card className="w-full max-w-4xl bg-black/50 backdrop-blur-sm border-slate-700 shadow-xl">
        <div className="p-4 border-b border-slate-700">
          <HomeButton />
        </div>
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Simple Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-4 mb-4 bg-red-900/50 border border-red-800 rounded-md text-white">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}

          {response && (
            <div className="p-4 bg-slate-900 rounded-lg">
              <p className="text-sm">{response}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-slate-700 p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-800 border-slate-700 focus-visible:ring-purple-500"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  )
}
