// Define Agent and Tool types
export type Tool = "memory" | "router" | "agents" | "fluxClient"

export type Agent = {
  id: string
  name: string
  description: string
  route: string
  tools: Tool[]
  goals: string[]
  active: boolean
  metadata?: Record<string, any>
}

// Load agent configurations
export function getAgents(): Agent[] {
  return [
    {
      id: "flux",
      name: "Flux Generator",
      description: "Generates images or creative outputs using the Flux model.",
      route: "/flux",
      tools: ["fluxClient"],
      goals: ["visual synthesis", "creative prompts"],
      active: true,
    },
    {
      id: "clair",
      name: "Clair Core",
      description: "The master logic, routing, and memory core.",
      route: "/agents/ctrl",
      tools: ["memory", "router", "agents"],
      goals: ["user alignment", "command interpretation", "agent delegation"],
      active: true,
    },
    {
      id: "memory",
      name: "Memory Agent",
      description: "Manages and retrieves from the memory store.",
      route: "/memory",
      tools: ["memory"],
      goals: ["information retrieval", "context management"],
      active: true,
    },
  ]
}

// Get a specific agent by ID
export function getAgent(id: string): Agent | undefined {
  return getAgents().find((agent) => agent.id === id)
}

// Determine which agent should handle a request
export function routeRequest(prompt: string): Agent {
  const agents = getAgents()

  // Simple keyword-based routing for now
  // In a more advanced implementation, this would use embeddings or a classifier

  // Check for Flux-related keywords
  if (
    prompt.toLowerCase().includes("generate") ||
    prompt.toLowerCase().includes("image") ||
    prompt.toLowerCase().includes("picture") ||
    prompt.toLowerCase().includes("create") ||
    prompt.toLowerCase().includes("draw")
  ) {
    return agents.find((agent) => agent.id === "flux") || agents[0]
  }

  // Check for memory-related keywords
  if (
    prompt.toLowerCase().includes("remember") ||
    prompt.toLowerCase().includes("recall") ||
    prompt.toLowerCase().includes("memory") ||
    prompt.toLowerCase().includes("stored") ||
    prompt.toLowerCase().includes("previous")
  ) {
    return agents.find((agent) => agent.id === "memory") || agents[0]
  }

  // Default to Clair Core
  return agents.find((agent) => agent.id === "clair") || agents[0]
}
