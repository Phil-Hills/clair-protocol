"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Save, Search, Menu, X, User, Bot, Brain, Database, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

// Define message type
type Message = {
  id: string
  content: string
  sender: "user" | "assistant" | "system"
  timestamp: Date
  role?: "user" | "assistant" | "system"
  agentId?: string
}

interface ClairConsoleProps {
  initialMessages?: Message[]
  className?: string
}

export function ClairConsole({ initialMessages, className }: ClairConsoleProps) {
  const [ctpProfile, setCtpProfile] = useLocalStorage("ctp-profile", {
    identity: "",
    voiceRules: "",
    coreBeliefs: "",
    modes: [],
  })

  // Custom chat state
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: "1",
        content: "Welcome to ClairOS. How can I assist you today?",
        sender: "assistant",
        timestamp: new Date(),
      },
    ],
  )
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inside the component, add the toast hook
  const { toast, toasts, dismiss } = useToast()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Declare setupErrorHandling function
  const setupErrorHandling = () => {
    // Implement your error handling logic here
    console.log("Setting up error handling...")
  }

  useEffect(() => {
    setupErrorHandling()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${input}"`,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)

    setInput("")
  }

  // Updated to make a POST request to the save endpoint
  const handleSaveToMemory = async () => {
    if (!input.trim()) {
      // Add a system message if no input
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: "Please enter text to save to memory.",
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemMessage])
      return
    }

    // Add user action message
    const userActionMessage: Message = {
      id: Date.now().toString(),
      content: `Saving to memory: "${input}"`,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userActionMessage])

    try {
      // Make POST request to save endpoint
      const response = await fetch("https://clairos-kernel-411074311481.us-central1.run.app/memory/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: input }),
      })

      const data = await response.json()

      // Add system response message
      const systemResponseMessage: Message = {
        id: Date.now().toString(),
        content: data.message || "Memory saved successfully.",
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemResponseMessage])
    } catch (error) {
      console.error("Error saving to memory:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Error saving to memory. Please try again.",
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    // Clear input after saving
    setInput("")
  }

  // Updated to make a POST request to the query endpoint
  const handleQueryMemory = async () => {
    if (!input.trim()) {
      // Add a system message if no input
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: "Please enter a keyword to query memory.",
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemMessage])
      return
    }

    // Add user action message
    const userActionMessage: Message = {
      id: Date.now().toString(),
      content: `Querying memory for: "${input}"`,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userActionMessage])

    try {
      // Make POST request to query endpoint
      const response = await fetch("https://clairos-kernel-411074311481.us-central1.run.app/memory/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: input }),
      })

      const data = await response.json()

      // Format the results
      let resultContent = ""
      if (data.results && data.results.length > 0) {
        resultContent =
          "Memory query results:\n\n" +
          data.results
            .map((item: any, index: number) => `${index + 1}. ${item.task || item.content || JSON.stringify(item)}`)
            .join("\n\n")
      } else {
        resultContent = "No matching memories found."
      }

      // Add system response message
      const systemResponseMessage: Message = {
        id: Date.now().toString(),
        content: resultContent,
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemResponseMessage])
    } catch (error) {
      console.error("Error querying memory:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Error querying memory. Please try again.",
        sender: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    // Clear input after querying
    setInput("")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Handle form submission with improved error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
      role: "user",
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
        content: data.response || "I received your message but couldn't generate a proper response.",
        agentId: data.agent?.id,
        sender: "assistant",
        timestamp: new Date(),
        role: "assistant",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      console.error("Error sending message:", err)

      // Add error message to the chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm having trouble processing your request right now. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
        role: "assistant",
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
    <div className={cn("flex h-screen bg-gray-950 text-gray-100", className)}>
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ClairOS
          </h1>
          <p className="text-xs text-gray-500 mt-1">Intelligent Memory System</p>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User size={16} className="text-blue-400" />
            </div>
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Bot size={16} className="text-purple-400" />
            </div>
            <span>Chat Console</span>
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Save size={16} className="text-green-400" />
            </div>
            <span>Memory Bank</span>
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium">PH</span>
            </div>
            <div>
              <p className="text-sm font-medium">Phil Hills</p>
              <p className="text-xs text-gray-500">System Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "lg:ml-64" : "ml-0")}>
        {/* Chat header */}
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-medium">Chat Console</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
              onClick={handleSaveToMemory}
            >
              <Save size={16} className="mr-2" />
              Save to Memory
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
              onClick={handleQueryMemory}
            >
              <Search size={16} className="mr-2" />
              Query Memory
            </Button>
          </div>
        </header>

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 max-w-3xl message-animation",
                  message.sender === "user" ? "ml-auto" : message.sender === "system" ? "mx-auto" : "mr-auto",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.sender === "user"
                      ? "bg-blue-500/20 order-2"
                      : message.sender === "system"
                        ? "bg-green-500/20 order-1"
                        : "bg-purple-500/20 order-1",
                  )}
                >
                  {message.sender === "user" ? (
                    <User size={16} className="text-blue-400" />
                  ) : message.sender === "system" ? (
                    <Database size={16} className="text-green-400" />
                  ) : (
                    <Bot size={16} className="text-purple-400" />
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-lg p-3 text-sm",
                    message.sender === "user"
                      ? "bg-blue-500/10 border border-blue-500/20 order-1"
                      : message.sender === "system"
                        ? "bg-green-500/10 border border-green-500/20 order-2 w-full"
                        : "bg-gray-800 border border-gray-700 order-2",
                  )}
                >
                  <div className="mb-1 whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-gray-500 text-right">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border-gray-700 focus-visible:ring-purple-500"
            />
            <Button type="submit">
              <Send size={16} className="mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Toast container for notifications */}
      {toasts.length > 0 && <ToastContainer toasts={toasts} onDismiss={dismiss} />}
    </div>
  )
}
