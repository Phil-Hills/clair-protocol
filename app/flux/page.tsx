"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import FluxResultViewer from "./FluxResultViewer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Trash2, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type FluxChat = {
  id: string
  prompt: string
  result: any
  timestamp: number
}

export default function FluxPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeChat, setActiveChat] = useState<string | null>(null)

  // Use localStorage to persist chat history
  const [chatHistory, setChatHistory] = useLocalStorage<FluxChat[]>("flux-chat-history", [])

  // Load active chat if set
  useEffect(() => {
    if (activeChat) {
      const chat = chatHistory.find((c) => c.id === activeChat)
      if (chat) {
        setPrompt(chat.prompt)
        setResult(chat.result)
      }
    }
  }, [activeChat, chatHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setResult(null)
    setError("")
    setActiveChat(null)

    try {
      const res = await fetch("/api/flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Unknown error")
      } else {
        setResult(data.result)

        // Save to chat history
        const newChat: FluxChat = {
          id: Date.now().toString(),
          prompt,
          result: data.result,
          timestamp: Date.now(),
        }

        setChatHistory((prev) => [newChat, ...prev])
        setActiveChat(newChat.id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      setChatHistory([])
      setActiveChat(null)
      setResult(null)
    }
  }

  const selectChat = (id: string) => {
    setActiveChat(id)
  }

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id))
    if (activeChat === id) {
      setActiveChat(null)
      setResult(null)
    }
  }

  const startNewChat = () => {
    setActiveChat(null)
    setPrompt("")
    setResult(null)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      {/* Chat History Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-64 bg-gray-900 border-r border-gray-700 transition-transform duration-300 transform md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-bold">Flux History</h2>
            {chatHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="hover:bg-red-900/20 text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <Button
              variant="outline"
              className="w-full mb-3 bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30"
              onClick={startNewChat}
            >
              New Generation
            </Button>

            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No history yet</p>
                <p className="text-xs mt-1">Your generations will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className={cn(
                      "p-2 rounded cursor-pointer hover:bg-gray-800 flex justify-between group",
                      activeChat === chat.id ? "bg-gray-800 border border-gray-700" : "",
                    )}
                  >
                    <div className="truncate flex-1">
                      <p className="truncate text-sm">{chat.prompt}</p>
                      <p className="text-xs text-gray-500">{new Date(chat.timestamp).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-400"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button (Mobile) */}
      <button
        className="fixed bottom-4 left-4 z-20 md:hidden bg-gray-800 p-2 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>

      {/* Main Content */}
      <div className={cn("flex-1 p-4 md:p-8 transition-all duration-300", sidebarOpen ? "md:ml-0" : "")}>
        <h1 className="text-3xl font-bold mb-4">🧠 Flux Image Generation</h1>
        <p className="text-gray-400 mb-6">Generate unfiltered images from text descriptions using Flux AI</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. glowing techno angel surfing lava"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-semibold"
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Generate
                </>
              )}
            </Button>
          </div>
        </form>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Generated Result</h2>
            <FluxResultViewer result={result} />
          </div>
        )}
      </div>
    </div>
  )
}
