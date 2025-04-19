"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Trash2, Edit, Plus, Database, ArrowLeft } from "lucide-react"
import { useMemory, type MemoryNode } from "@/lib/memory"
import { MemoryGraph } from "./MemoryGraph"
import Link from "next/link"
// Import the HomeButton component
import { HomeButton } from "@/components/home-button"

export default function MemoryPage() {
  const { memory, addNode, updateNode, connectNodes, searchNodes, clearMemory } = useMemory()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MemoryNode[]>([])
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null)
  const [editNode, setEditNode] = useState<MemoryNode | null>(null)
  const [newNodeContent, setNewNodeContent] = useState("")
  const [newNodeType, setNewNodeType] = useState<"memory" | "prompt" | "response" | "decision">("memory")
  const [activeTab, setActiveTab] = useState("graph")

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = searchNodes(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching nodes:", error)
      // Show a user-friendly error message
      setSearchResults([])
      // You could add state for error messages if needed
    }
  }

  // Handle node selection
  const handleNodeSelect = (node: MemoryNode) => {
    setSelectedNode(node)
  }

  // Handle node update
  const handleUpdateNode = () => {
    if (!editNode) return

    updateNode(editNode.id, {
      content: editNode.content,
      metadata: editNode.metadata,
    })

    setEditNode(null)
  }

  // Handle new node creation
  const handleAddNode = () => {
    if (!newNodeContent.trim()) return

    const newNode = addNode({
      type: newNodeType,
      content: newNodeContent,
      connections: selectedNode ? [selectedNode.id] : [],
    })

    setNewNodeContent("")
    setSelectedNode(newNode)
  }

  // Handle memory clear
  const handleClearMemory = () => {
    if (confirm("Are you sure you want to clear all memory? This action cannot be undone.")) {
      clearMemory()
      setSelectedNode(null)
      setEditNode(null)
      setSearchResults([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <HomeButton variant="ghost" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/agents/ctrl">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Control
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Memory Visualization</h1>
        </div>
        <p className="text-gray-400 mb-6">Explore and manage Clair's memory network</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Memory Controls</CardTitle>
                <CardDescription>Search and manage memory nodes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                    placeholder="Search memory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium">Search Results</h3>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {searchResults.map((node) => (
                        <div
                          key={node.id}
                          className={`p-2 rounded-md cursor-pointer ${
                            selectedNode?.id === node.id
                              ? "bg-blue-900/30 border border-blue-500"
                              : "bg-gray-800 hover:bg-gray-700"
                          }`}
                          onClick={() => handleNodeSelect(node)}
                        >
                          <div className="flex justify-between">
                            <Badge variant="outline" className="text-xs">
                              {node.type}
                            </Badge>
                            <span className="text-xs text-gray-400">{new Date(node.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="mt-1 text-sm truncate">{node.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-2">Add New Memory</h3>
                  <div className="space-y-2">
                    <Select value={newNodeType} onValueChange={(value: any) => setNewNodeType(value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select node type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="memory">Memory</SelectItem>
                        <SelectItem value="prompt">Prompt</SelectItem>
                        <SelectItem value="response">Response</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter memory content..."
                      value={newNodeContent}
                      onChange={(e) => setNewNodeContent(e.target.value)}
                    />
                    <Button onClick={handleAddNode} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Node
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleClearMemory} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" /> Clear All Memory
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Visualization */}
          <div className="md:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="w-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-800 w-full">
                      <TabsTrigger value="graph" className="flex-1">
                        Graph View
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex-1">
                        Node Details
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-0">
                  {activeTab === "graph" && (
                    <div className="h-[500px] bg-gray-800 rounded-lg overflow-hidden">
                      <MemoryGraph
                        nodes={memory.nodes}
                        onNodeSelect={handleNodeSelect}
                        selectedNodeId={selectedNode?.id}
                      />
                    </div>
                  )}

                  {activeTab === "details" && (
                    <>
                      {selectedNode ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="outline" className="mb-2">
                                {selectedNode.type}
                              </Badge>
                              <p className="text-xs text-gray-400">
                                Created: {new Date(selectedNode.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Edit Memory Node</DialogTitle>
                                    <DialogDescription>Make changes to this memory node's content.</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Textarea
                                      className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                                      value={editNode?.content || selectedNode.content}
                                      onChange={(e) =>
                                        setEditNode({
                                          ...(editNode || selectedNode),
                                          content: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditNode(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateNode}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="font-medium mb-2">Content</h3>
                            <p className="whitespace-pre-wrap">{selectedNode.content}</p>
                          </div>

                          <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="font-medium mb-2">Connections ({selectedNode.connections.length})</h3>
                            {selectedNode.connections.length > 0 ? (
                              <div className="space-y-2">
                                {selectedNode.connections.map((connectionId) => {
                                  const connectedNode = memory.nodes.find((n) => n.id === connectionId)
                                  return connectedNode ? (
                                    <div
                                      key={connectionId}
                                      className="p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600"
                                      onClick={() => handleNodeSelect(connectedNode)}
                                    >
                                      <div className="flex justify-between">
                                        <Badge variant="outline" className="text-xs">
                                          {connectedNode.type}
                                        </Badge>
                                        <span className="text-xs text-gray-400">
                                          {new Date(connectedNode.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm truncate">{connectedNode.content}</p>
                                    </div>
                                  ) : null
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500">No connections</p>
                            )}
                          </div>

                          {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                            <div className="p-4 bg-gray-800 rounded-lg">
                              <h3 className="font-medium mb-2">Metadata</h3>
                              <pre className="text-xs bg-gray-700 p-2 rounded overflow-auto">
                                {JSON.stringify(selectedNode.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-[400px] flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Database className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>Select a node to view details</p>
                          </div>
                        </div>
                      )}
                    </>
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
