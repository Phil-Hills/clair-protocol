"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HomeButton } from "@/components/home-button"

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState("Hello, this is a test message")

  const testAgentsApi = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test the agents API directly
      const response = await fetch("/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: testMessage,
        }),
      })

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      // Try to parse the response as JSON
      try {
        const data = await response.json()
        setResult(data)
      } catch (parseError) {
        console.error("Error parsing response:", parseError)

        // Get the raw response text
        const responseText = await response.text()
        throw new Error(`Failed to parse response as JSON: ${responseText.substring(0, 100)}...`)
      }
    } catch (err: any) {
      console.error("Error testing API:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testAgentsEndpoint = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test the agents API through the test endpoint
      const response = await fetch("/api/test-agents")

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`)
      }

      // Parse the response
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error("Error testing API endpoint:", err)
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
            API Test
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="test-message" className="block text-sm font-medium">
              Test Message
            </label>
            <Input
              id="test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>

          <div className="flex space-x-4">
            <Button onClick={testAgentsApi} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Testing..." : "Test Agents API Directly"}
            </Button>

            <Button onClick={testAgentsEndpoint} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? "Testing..." : "Test Agents API Endpoint"}
            </Button>
          </div>

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
