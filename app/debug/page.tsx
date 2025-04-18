"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugInfo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug")

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      const data = await response.json()
      setDebugInfo(data)
    } catch (err: any) {
      console.error("Error fetching debug info:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch debug info on mount
  useEffect(() => {
    fetchDebugInfo()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-slate-900 to-black text-white">
      <Card className="w-full max-w-4xl bg-black/50 backdrop-blur-sm border-slate-700 shadow-xl">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Debug Information
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-slate-400">Loading debug information...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/50 border border-red-800 rounded-md text-white">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
              <Button onClick={fetchDebugInfo} className="mt-2">
                Retry
              </Button>
            </div>
          ) : debugInfo ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-bold mb-2">Environment:</h3>
                <pre className="text-sm whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(debugInfo.environment, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-bold mb-2">Message:</h3>
                <p>{debugInfo.message}</p>
              </div>
            </div>
          ) : (
            <p>No debug information available.</p>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="outline" asChild>
              <Link href="/">Back to Chat</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/verify">Verify API Key</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
