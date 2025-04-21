"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Save, Search, Menu, X, User, Bot, Brain } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"

// Define message type
type Message = {
  id: string
  content: string
  type: "user" | "system" | "assistant"
  timestamp: Date
}

interface ClairConsoleProps {
  initialMessages?: Message[]
  className?: string
}

export function ClairConsole({ initialMessages, className = "" }: ClairConsoleProps) {
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
        id: "welcome",
        content: "Welcome to ClairOS. How can I assist you today?",
        type: "assistant",
        timestamp: new Date(),
      },
    ],
  )
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
  }

  // Handle saving to memory
  const handleSaveToMemory = async () => {
    if (!input.trim()) {
      // Add a system message if no input
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: "Please enter text to save to memory.",
        type: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemMessage])
      return
    }

    setIsLoading(true)

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
        type: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemResponseMessage])
    } catch (error) {
      console.error("Error saving to memory:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Error saving to memory. Please try again.",
        type: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }

    // Clear input after saving
    setInput("")
  }

  // Handle querying memory
  const handleQueryMemory = async () => {
    if (!input.trim()) {
      // Add a system message if no input
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: "Please enter a keyword to query memory.",
        type: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemMessage])
      return
    }

    setIsLoading(true)

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
        type: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemResponseMessage])
    } catch (error) {
      console.error("Error querying memory:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Error querying memory. Please try again.",
        type: "system",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }

    // Clear input after querying
    setInput("")
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ClairOS
          </h1>
          <p className="text-xs text-gray-500 mt-1">Intelligent Memory System</p>
        </div>

        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-2 p-2 rounded-md bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Bot size={16} className="text-purple-400" />
            </div>
            <span>Console</span>
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Brain size={16} className="text-blue-400" />
            </div>
            <span>Agents</span>
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-400"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span>Settings</span>
          </a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        {/* Chat header */}
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-medium">Chat Console</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSaveToMemory}
              disabled={isLoading}
              className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md hover:bg-purple-500/20 transition-colors text-sm font-medium flex items-center"
              aria-label="Save to Memory"
            >
              <Save size={16} className="mr-2" />
              Save to Memory
            </button>
            <button
              onClick={handleQueryMemory}
              disabled={isLoading}
              className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors text-sm font-medium flex items-center"
              aria-label="Query Memory"
            >
              <Search size={16} className="mr-2" />
              Query Memory
            </button>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 max-w-3xl animate-fadeIn ${
                  message.type === "user" ? "ml-auto" : message.type === "system" ? "mx-auto" : "mr-auto"
                }`}
              >
                {message.type !== "user" && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "system" ? "bg-green-500/20" : "bg-purple-500/20"
                    }`}
                  >
                    {message.type === "system" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-400"
                      >
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                    ) : (
                      <Brain size={16} className="text-purple-400" />
                    )}
                  </div>
                )}

                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.type === "user"
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : message.type === "system"
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-gray-800 border border-gray-700"
                  }`}
                >
                  <div className="mb-1 whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-gray-500 text-right">{formatTime(message.timestamp)}</div>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              disabled={isLoading}
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={16} className="mr-2" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
