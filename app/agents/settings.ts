// Agent configuration profiles
export const agents = [
  {
    id: "flux",
    name: "Flux Generator",
    description: "Generates images or creative outputs using the Flux model.",
    route: "/flux",
    tools: ["fluxClient"],
    goals: ["visual synthesis", "creative prompts"],
    icon: "image",
    color: "#6366f1",
  },
  {
    id: "clair",
    name: "Clair Core",
    description: "The master logic, routing, and memory core.",
    route: "/agents/ctrl",
    tools: ["memory", "router", "agents"],
    goals: ["user alignment", "command interpretation", "agent delegation"],
    icon: "brain",
    color: "#8b5cf6",
  },
  {
    id: "memory",
    name: "Memory Agent",
    description: "Manages and retrieves from the memory store.",
    route: "/memory",
    tools: ["memory"],
    goals: ["information retrieval", "context management"],
    icon: "database",
    color: "#ec4899",
  },
]

export const systemPrompts = {
  flux: `You are Flux, an advanced image generation agent. Your purpose is to create vivid, detailed images based on user prompts. 
  When given a prompt, you should enhance it with additional details to create the best possible image.`,

  clair: `You are Clair, the core intelligence of the Ctrl-Clair system. Your purpose is to understand user requests, 
  route them to the appropriate agent, and maintain coherent conversations. You have access to memory and can delegate tasks.`,

  memory: `You are the Memory Agent, responsible for storing and retrieving information from the Ctrl-Clair memory system. 
  You can search for relevant information, connect related concepts, and help maintain the knowledge graph.`,
}

export const defaultAgentId = "clair"
