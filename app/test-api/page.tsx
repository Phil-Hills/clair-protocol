"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-api")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API test failed")
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error testing API:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-slate-900 to-black text-white">
      <Card className="w-full max-w-4xl bg-black/50 backdrop-blur-sm border-slate-700 shadow-xl">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            OpenAI API Test
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <Button onClick={testApi} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Testing..." : "Test OpenAI API"}
          </Button>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-800 rounded-md text-white">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-slate-900 rounded-lg">
              <h3 className="font-bold mb-2">API Test Result:</h3>
              <pre className="text-sm whitespace-pre-wrap overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
