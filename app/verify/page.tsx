"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
// Import the HomeButton component
import { HomeButton } from "@/components/home-button"

export default function VerifyPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyApiKey = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/verify-key")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "API verification failed")
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error verifying API key:", err)
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
            Verify OpenAI API Key
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <p className="text-slate-300">
            Click the button below to verify that your OpenAI API key is working correctly.
          </p>

          <Button onClick={verifyApiKey} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify API Key"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-800 rounded-md text-white">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-900/50 border border-green-800 rounded-md text-white">
              <h3 className="font-bold">Success!</h3>
              <p>Your OpenAI API key is working correctly.</p>
              <p className="mt-2">Response: {result.response}</p>
            </div>
          )}

          <div className="mt-4">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Back to Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
