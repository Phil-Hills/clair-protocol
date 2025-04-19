"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, Database, ImageIcon, Send, Loader2, LayoutDashboard, Settings, History } from "lucide-react"
import { agents } from "../settings"
import { useMemory } from "@/lib/memory"
import Link from "next/link"
// Import the HomeButton component
import { HomeButton } from "@/components/home-button"

export default function CtrlPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [response, setResponse] = useState<any>(null)
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const { memory, getRecentNodes } = useMemory()
  const router = useRouter()

  const recentMemory = getRecentNodes(5)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch("/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
      setActiveAgent(data.agent?.id || null)
    } catch (error) {
      console.error("Error processing prompt:", error)
      setResponse({
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "flux":
        return <ImageIcon className="h-5 w-5" />
      case "memory":
        return <Database className="h-5 w-5" />
      case "clair":
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const navigateToAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    if (agent && agent.route) {
      router.push(agent.route)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <HomeButton variant="ghost" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Ctrl-Clair Command Center</h1>
        <p className="text-gray-400 mb-6">Master Control Program for Agent Routing and Intelligence</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Agent Status */}
          <div className="md:col-span-1">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Agent Network</CardTitle>
                <CardDescription>Available intelligent agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeAgent === agent.id
                        ? "bg-blue-900/30 border-blue-500"
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() => navigateToAgent(agent.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-blue-600">
                        <span>{getAgentIcon(agent.id)}</span>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-xs text-gray-400">{agent.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {agent.goals.map((goal) => (
                        <Badge key={goal} variant="outline" className="text-xs bg-gray-800">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/memory">
                      <Database className="h-4 w-4 mr-2" /> Memory
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/flux">
                      <ImageIcon className="h-4 w-4 mr-2" /> Flux
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Middle and Right Columns */}
          <div className="md:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="w-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-800 w-full">
                      <TabsTrigger value="dashboard" className="flex-1">
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                      </TabsTrigger>
                      <TabsTrigger value="history" className="flex-1">
                        <History className="h-4 w-4 mr-2" /> History
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mt-0">
                  {activeTab === "dashboard" && (
                    <div className="space-y-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            className="flex-1 bg-gray-800 border-gray-700 text-white"
                            placeholder="Enter a command or question..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={loading}
                          />
                          <Button type="submit" disabled={loading || !prompt.trim()}>
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" /> Send
                              </>
                            )}
                          </Button>
                        </div>
                      </form>

                      {response && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                          {response.error ? (
                            <div className="text-red-400">
                              <h3 className="font-bold">Error</h3>
                              <p>{response.error}</p>
                              {response.details && <p className="text-sm mt-1">{response.details}</p>}
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6 bg-blue-600">
                                  <span>{getAgentIcon(response.agent?.id || "clair")}</span>
                                </Avatar>
                                <span className="text-sm font-medium">{response.agent?.name || "Clair"}</span>
                              </div>
                              <p className="whitespace-pre-wrap">{response.response}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Recent Activity</h3>
                      {recentMemory.length > 0 ? (
                        recentMemory.map((node) => (
                          <div key={node.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{new Date(node.timestamp).toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs">
                                {node.type}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm truncate">{node.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No recent activity</p>
                      )}
                      <div className="mt-4">
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/memory">
                            <Database className="h-4 w-4 mr-2" /> View Full Memory
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Agent Configuration</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {agents.map((agent) => (
                          <div key={agent.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 bg-blue-600">
                                  <span>{getAgentIcon(agent.id)}</span>
                                </Avatar>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`bg-${agent.id === "clair" ? "green" : "blue"}-900/30`}
                              >
                                {agent.id === "clair" ? "Primary" : "Secondary"}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-400">{agent.description}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {agent.tools.map((tool) => (
                                  <Badge key={tool} variant="secondary" className="text-xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
