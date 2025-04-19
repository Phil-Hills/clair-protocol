// Memory store and synchronization utilities
import { useLocalStorage } from "@/hooks/use-local-storage"

export type MemoryNode = {
  id: string
  type: "prompt" | "response" | "decision" | "agent" | "memory"
  content: string
  timestamp: number
  connections: string[] // IDs of connected nodes
  metadata?: Record<string, any>
}

export type Memory = {
  nodes: MemoryNode[]
  lastAccessed: number
}

// In-memory cache for faster access
let memoryCache: Memory = {
  nodes: [],
  lastAccessed: Date.now(),
}

// Initialize memory from localStorage if available
export function initializeMemory(): Memory {
  try {
    const storedMemory = localStorage.getItem("clair-memory")
    if (storedMemory) {
      memoryCache = JSON.parse(storedMemory)
    }
    return memoryCache
  } catch (error) {
    console.error("Error initializing memory:", error)
    return memoryCache
  }
}

// Save memory to localStorage
export function persistMemory(memory: Memory): void {
  try {
    localStorage.setItem("clair-memory", JSON.stringify(memory))
    memoryCache = memory
  } catch (error) {
    console.error("Error persisting memory:", error)
  }
}

// Add a new node to memory
export function addMemoryNode(node: Omit<MemoryNode, "id" | "timestamp">): MemoryNode {
  const newNode: MemoryNode = {
    ...node,
    id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    connections: node.connections || [],
  }

  const memory = getMemory()
  memory.nodes.push(newNode)
  memory.lastAccessed = Date.now()
  persistMemory(memory)

  return newNode
}

// Get a node by ID
export function getMemoryNode(id: string): MemoryNode | undefined {
  const memory = getMemory()
  return memory.nodes.find((node) => node.id === id)
}

// Update an existing node
export function updateMemoryNode(id: string, updates: Partial<MemoryNode>): MemoryNode | null {
  const memory = getMemory()
  const nodeIndex = memory.nodes.findIndex((node) => node.id === id)

  if (nodeIndex === -1) return null

  const updatedNode = {
    ...memory.nodes[nodeIndex],
    ...updates,
    timestamp: updates.timestamp || Date.now(),
  }

  memory.nodes[nodeIndex] = updatedNode
  memory.lastAccessed = Date.now()
  persistMemory(memory)

  return updatedNode
}

// Connect two nodes
export function connectNodes(sourceId: string, targetId: string): boolean {
  const memory = getMemory()
  const sourceNode = memory.nodes.find((node) => node.id === sourceId)
  const targetNode = memory.nodes.find((node) => node.id === targetId)

  if (!sourceNode || !targetNode) return false

  if (!sourceNode.connections.includes(targetId)) {
    sourceNode.connections.push(targetId)
  }

  if (!targetNode.connections.includes(sourceId)) {
    targetNode.connections.push(sourceId)
  }

  memory.lastAccessed = Date.now()
  persistMemory(memory)

  return true
}

// Get the current memory state
export function getMemory(): Memory {
  if (memoryCache.nodes.length === 0) {
    initializeMemory()
  }
  return memoryCache
}

// Search memory by content
export function searchMemory(query: string): MemoryNode[] {
  const memory = getMemory()
  const lowerQuery = query.toLowerCase()

  return memory.nodes.filter((node) => node.content.toLowerCase().includes(lowerQuery))
}

// Get recent memory nodes
export function getRecentMemory(limit = 10): MemoryNode[] {
  const memory = getMemory()
  return [...memory.nodes].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}

// Clear all memory
export function clearMemory(): void {
  memoryCache = {
    nodes: [],
    lastAccessed: Date.now(),
  }
  persistMemory(memoryCache)
}

// React hook for memory
export function useMemory() {
  const [memory, setMemoryState] = useLocalStorage<Memory>("clair-memory", {
    nodes: [],
    lastAccessed: Date.now(),
  })

  const updateMemory = (newMemory: Memory) => {
    setMemoryState(newMemory)
    memoryCache = newMemory
  }

  return {
    memory,
    updateMemory,
    addNode: (node: Omit<MemoryNode, "id" | "timestamp">) => {
      const newNode = addMemoryNode(node)
      setMemoryState({
        ...memory,
        nodes: [...memory.nodes, newNode],
        lastAccessed: Date.now(),
      })
      return newNode
    },
    updateNode: (id: string, updates: Partial<MemoryNode>) => {
      const updatedNode = updateMemoryNode(id, updates)
      if (updatedNode) {
        setMemoryState({
          ...memory,
          nodes: memory.nodes.map((node) => (node.id === id ? updatedNode : node)),
          lastAccessed: Date.now(),
        })
      }
      return updatedNode
    },
    connectNodes: (sourceId: string, targetId: string) => {
      const success = connectNodes(sourceId, targetId)
      if (success) {
        setMemoryState({
          ...memory,
          nodes: memory.nodes.map((node) => {
            if (node.id === sourceId && !node.connections.includes(targetId)) {
              return { ...node, connections: [...node.connections, targetId] }
            }
            if (node.id === targetId && !node.connections.includes(sourceId)) {
              return { ...node, connections: [...node.connections, sourceId] }
            }
            return node
          }),
          lastAccessed: Date.now(),
        })
      }
      return success
    },
    searchNodes: (query: string) => searchMemory(query),
    getRecentNodes: (limit = 10) => getRecentMemory(limit),
    clearMemory: () => {
      clearMemory()
      setMemoryState({
        nodes: [],
        lastAccessed: Date.now(),
      })
    },
  }
}
