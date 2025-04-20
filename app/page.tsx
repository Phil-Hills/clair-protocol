"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, AlertCircle, Loader2, Brain, Database, ImageIcon } from "lucide-react"
import { ProfileSettings } from "@/components/profile-settings"
import { CTPSettings } from "@/components/ctp-settings"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn, setupErrorHandling } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Import the HomeButton component
import { HomeButton } from "@/components/home-button"

// Import the toast components
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

// Define message type
type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agentId?: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat")
  const [ctpProfile, setCtpProfile] = useLocalStorage("ctp-profile", {
    identity: "",
    voiceRules: "",
    coreBeliefs: "",
    modes: [],
  })

  // Custom chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inside the Home component, add the toast hook
  const { toast, toasts, dismiss } = useToast()

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    setupErrorHandling()
  }, [])

  // Handle form submission with improved error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Send request to our agent API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      console.log("Sending request to /agents with prompt:", input)

      // Use a try-catch block specifically for the fetch operation
      let response
      try {
        response = await fetch("/agents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: input,
          }),
          signal: controller.signal,
        })
      } catch (fetchError) {
        console.error("Fetch operation failed:", fetchError)
        throw new Error(`Network error: ${fetchError.message}`)
      }

      clearTimeout(timeoutId)
      console.log("Received response:", response.status, response.statusText)

      // Check if response is OK
      if (!response.ok) {
        // Try to get the response as text first
        let responseText
        try {
          responseText = await response.text()
          console.error("Error response text:", responseText)
        } catch (textError) {
          console.error("Failed to get error response text:", textError)
          responseText = "Could not retrieve error details"
        }

        // Try to parse as JSON if possible
        let errorData
        try {
          errorData = JSON.parse(responseText)
          throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`)
        } catch (jsonError) {
          // If it's not valid JSON, use the text directly
          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`)
        }
      }

      // Get the response content type
      const contentType = response.headers.get("content-type")
      console.log("Response content type:", contentType)

      // Parse response based on content type
      let data
      if (contentType && contentType.includes("application/json")) {
        try {
          // Clone the response before parsing to avoid "body already read" errors
          const clonedResponse = response.clone()
          data = await clonedResponse.json()
          console.log("Parsed JSON response:", data)
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError)

          // Try to get the response as text
          const responseText = await response.text()
          console.log("Raw response:", responseText)

          // Create a fallback response
          data = {
            response: "I received your message but couldn't process it properly.",
            agent: {
              id: "clair",
              name: "Clair Core",
            },
          }
        }
      } else {
        // Handle non-JSON responses
        const responseText = await response.text()
        console.log("Non-JSON response:", responseText)

        // Create a fallback response
        data = {
          response: "I received your message but the server returned an unexpected response format.",
          agent: {
            id: "clair",
            name: "Clair Core",
          },
        }
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || "I received your message but couldn't generate a proper response.",
        agentId: data.agent?.id,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      console.error("Error sending message:", err)

      // Add error message to the chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble processing your request right now. Please try again later.",
      }

      setMessages((prev) => [...prev, errorMessage])

      // Show toast notification
      toast({
        title: "Connection Error",
        description: err.message || "There was a problem connecting to the server.",
        variant: "destructive",
      })

      setError("Connection error. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Get agent icon
  const getAgentIcon = (agentId?: string) => {
    switch (agentId) {
      case "flux":
        return <ImageIcon className="h-4 w-4" />
      case "memory":
        return <Database className="h-4 w-4" />
      case "clair":
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-slate-900 to-black text-white">
      <Card className="w-full max-w-4xl bg-black/50 backdrop-blur-sm border-slate-700 shadow-xl">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              CLAIR
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex space-x-2">
                <HomeButton />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/agents/ctrl">
                    <Brain className="h-4 w-4 mr-1" /> Control
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/memory">
                    <Database className="h-4 w-4 mr-1" /> Memory
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/flux">
                    <ImageIcon className="h-4 w-4 mr-1" /> Flux
                  </Link>
                </Button>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-slate-800">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="ctp">CTP</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <div>
          {activeTab === "chat" && (
            <>
              <CardContent className="p-4 h-[60vh] overflow-y-auto">
                {error && (
                  <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                      <p>{error}</p>
                      <Button variant="outline" size="sm" onClick={() => setError(null)} className="self-start">
                        Dismiss
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  {messages.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                      <Brain className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-center">Start a conversation with Clair</p>
                      <p className="text-sm text-center mt-2">Type a message below to begin</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          message.role === "user" ? "bg-slate-800" : "bg-slate-900",
                        )}
                      >
                        <Avatar className={cn("w-8 h-8", message.role === "user" ? "bg-blue-600" : "bg-purple-600")}>
                          <span className="text-xs font-bold">
                            {message.role === "user" ? "PH" : getAgentIcon(message.agentId)}
                          </span>
                        </Avatar>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                      <span className="ml-2 text-sm text-slate-400">Clair is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-700 p-4">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Clair..."
                    className="flex-1 bg-slate-800 border-slate-700 focus-visible:ring-purple-500"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}

          {activeTab === "ctp" && <CTPSettings ctpProfile={ctpProfile} setCtpProfile={setCtpProfile} />}

          {activeTab === "profile" && <ProfileSettings />}
        </div>
      </Card>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </main>
  )
}
