import { addMemoryNode, getMemory } from "./memory"
import { routeRequest, getAgents, type Agent } from "./agent-routing"
import { generateFluxContent } from "./flux"
import type { MemoryNode } from "./memory"

export type AgentAction = {
  agentId: string
  action: "process" | "delegate" | "respond" | "generate" | "store"
  payload: any
  timestamp: number
}

// Safely serialize objects to prevent circular reference errors
function safeSerialize(obj: any): any {
  try {
    // Test if the object can be serialized
    JSON.stringify(obj)
    return obj
  } catch (error) {
    console.error("Error serializing object:", error)
    // Return a simplified version of the object
    if (Array.isArray(obj)) {
      return obj.map((item) => safeSerialize(item))
    } else if (typeof obj === "object" && obj !== null) {
      const result: Record<string, any> = {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          try {
            const value = obj[key]
            // Skip functions and complex objects that can't be easily serialized
            if (typeof value !== "function" && typeof value !== "symbol") {
              result[key] = safeSerialize(value)
            }
          } catch (e) {
            result[key] = "[Unserializable data]"
          }
        }
      }
      return result
    }
    return String(obj)
  }
}

// Improve error handling in processPrompt function
export async function processPrompt(prompt: string): Promise<{
  response: string
  agent: Agent
  memoryNode: MemoryNode
}> {
  try {
    console.log("Starting to process prompt:", prompt.substring(0, 50) + "...")

    // Get a default agent to use in case of errors
    const defaultAgent = getAgents().find((a) => a.id === "clair") || {
      id: "clair",
      name: "Clair Core",
      description: "The master logic, routing, and memory core.",
      route: "/agents/ctrl",
      tools: ["memory", "router", "agents"],
      goals: ["user alignment", "command interpretation", "agent delegation"],
      active: true,
    }

    // Store the prompt in memory
    let promptNode
    try {
      promptNode = addMemoryNode({
        type: "prompt",
        content: prompt,
        connections: [],
      })
      console.log("Added prompt to memory:", promptNode.id)
    } catch (memoryError) {
      console.error("Error adding prompt to memory:", memoryError)
      // Continue execution even if memory storage fails
      promptNode = {
        id: `fallback_${Date.now()}`,
        type: "prompt",
        content: prompt,
        connections: [],
        timestamp: Date.now(),
      }
    }

    // Route the request to the appropriate agent
    let agent
    try {
      agent = routeRequest(prompt)
      console.log("Routed request to agent:", agent.id)
    } catch (routingError) {
      console.error("Error routing request:", routingError)
      agent = defaultAgent
    }

    // Create a decision node in memory
    let decisionNode
    try {
      decisionNode = addMemoryNode({
        type: "decision",
        content: `Routed to ${agent.name} agent`,
        connections: [promptNode.id],
        metadata: {
          agentId: agent.id,
          reasoning: `Request matched ${agent.id} agent criteria`,
        },
      })
      console.log("Added decision to memory:", decisionNode.id)
    } catch (memoryError) {
      console.error("Error adding decision to memory:", memoryError)
      // Continue execution even if memory storage fails
      decisionNode = {
        id: `fallback_decision_${Date.now()}`,
        type: "decision",
        content: `Routed to ${agent.name} agent`,
        connections: [promptNode.id],
        timestamp: Date.now(),
        metadata: {
          agentId: agent.id,
          reasoning: `Request matched ${agent.id} agent criteria`,
        },
      }
    }

    let response = ""

    // Process based on the selected agent
    try {
      console.log(`Processing with agent ${agent.id}`)

      switch (agent.id) {
        case "flux":
          try {
            console.log("Generating Flux content")
            const result = await generateFluxContent(prompt)
            if (result && result.error) {
              response = `I encountered an error while generating content: ${result.error}`
            } else {
              // Safely serialize the result
              const safeResult = safeSerialize(result)
              response =
                typeof safeResult === "string"
                  ? safeResult
                  : `Generated content is available at: ${JSON.stringify(safeResult)}`
            }
          } catch (fluxError) {
            console.error("Error generating Flux content:", fluxError)
            response = "I encountered an error while generating content with Flux."
          }
          break

        case "memory":
          // Simple memory retrieval for now
          try {
            console.log("Retrieving from memory")
            const memory = getMemory()
            const relevantNodes = memory.nodes
              .filter((node) => node.type === "response" && node.content.toLowerCase().includes(prompt.toLowerCase()))
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 3)

            if (relevantNodes.length > 0) {
              response = `I found these relevant memories:\n\n${relevantNodes
                .map((node) => `- ${node.content.substring(0, 100)}...`)
                .join("\n\n")}`
            } else {
              response = "I don't have any memories related to that query."
            }
          } catch (memoryError) {
            console.error("Error retrieving from memory:", memoryError)
            response = "I encountered an error while searching my memories."
          }
          break

        case "clair":
        default:
          // Default Clair response
          response = `I've received your message: "${prompt}". How can I assist you further?`
          break
      }

      console.log("Generated response:", response.substring(0, 50) + "...")
    } catch (processingError) {
      console.error("Error processing agent response:", processingError)
      response = "I encountered an unexpected error while processing your request."
    }

    // Store the response in memory
    let responseNode
    try {
      responseNode = addMemoryNode({
        type: "response",
        content: response,
        connections: [promptNode.id, decisionNode.id],
        metadata: {
          agentId: agent.id,
        },
      })
      console.log("Added response to memory:", responseNode.id)
    } catch (memoryError) {
      console.error("Error adding response to memory:", memoryError)
      // Create a fallback response node if memory storage fails
      responseNode = {
        id: `fallback_response_${Date.now()}`,
        type: "response",
        content: response,
        connections: [promptNode.id, decisionNode.id],
        timestamp: Date.now(),
        metadata: {
          agentId: agent.id,
        },
      }
    }

    // Ensure the agent object is serializable
    const safeAgent = safeSerialize(agent)

    console.log("Completed processing prompt")

    return {
      response,
      agent: safeAgent,
      memoryNode: responseNode,
    }
  } catch (error) {
    console.error("Error in processPrompt:", error)
    // Return a fallback response instead of throwing
    const fallbackAgent = getAgents().find((a) => a.id === "clair") || {
      id: "clair",
      name: "Clair Core",
      description: "The master logic, routing, and memory core.",
      route: "/agents/ctrl",
      tools: ["memory", "router", "agents"],
      goals: ["user alignment", "command interpretation", "agent delegation"],
      active: true,
    }

    let errorNode
    try {
      errorNode = addMemoryNode({
        type: "response",
        content: "I encountered an error processing your request.",
        connections: [],
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    } catch (memoryError) {
      console.error("Error adding error response to memory:", memoryError)
      errorNode = {
        id: `error_${Date.now()}`,
        type: "response",
        content: "I encountered an error processing your request.",
        connections: [],
        timestamp: Date.now(),
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }
    }

    return {
      response: "I encountered an error processing your request. Please try again.",
      agent: fallbackAgent,
      memoryNode: errorNode,
    }
  }
}

// Execute an agent action with improved error handling
export async function executeAgentAction(action: AgentAction): Promise<any> {
  try {
    // Record the action in memory
    try {
      addMemoryNode({
        type: "decision",
        content: `Agent ${action.agentId} executed ${action.action}`,
        connections: [],
        metadata: {
          agentId: action.agentId,
          action: action.action,
          payload: safeSerialize(action.payload),
        },
      })
    } catch (error) {
      console.error("Error recording agent action in memory:", error)
      // Continue execution even if memory storage fails
    }

    // Process the action based on type
    try {
      switch (action.action) {
        case "process":
          return processPrompt(action.payload.prompt)

        case "delegate":
          const targetAgent = getAgents().find((agent) => agent.id === action.payload.targetAgentId)
          if (!targetAgent) {
            return {
              response: `I couldn't find the agent "${action.payload.targetAgentId}" to delegate to.`,
              agent: { id: action.agentId },
            }
          }

          return executeAgentAction({
            agentId: targetAgent.id,
            action: action.payload.action,
            payload: action.payload.actionPayload,
            timestamp: Date.now(),
          })

        case "respond":
          // Just return the payload for a direct response
          return {
            response: action.payload.response || "I received your request.",
            agent: { id: action.agentId },
          }

        case "generate":
          const result = await generateFluxContent(action.payload.prompt)
          return {
            response: result.error
              ? `I encountered an error while generating content: ${result.error}`
              : `Generated content successfully.`,
            result: safeSerialize(result),
            agent: { id: action.agentId },
          }

        case "store":
          // Store data in memory
          const node = addMemoryNode({
            type: action.payload.nodeType || "memory",
            content: action.payload.content,
            connections: action.payload.connections || [],
            metadata: safeSerialize(action.payload.metadata),
          })
          return {
            response: "Information stored successfully.",
            node: safeSerialize(node),
            agent: { id: action.agentId },
          }

        default:
          return {
            response: `I don't know how to perform the action "${action.action}".`,
            agent: { id: action.agentId },
          }
      }
    } catch (error) {
      console.error(`Error executing agent action ${action.action}:`, error)
      return {
        response: `I encountered an error while trying to ${action.action}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        agent: { id: action.agentId },
      }
    }
  } catch (error) {
    console.error("Unhandled error in executeAgentAction:", error)
    return {
      response: "I encountered an unexpected error while processing your request.",
      agent: { id: "clair" },
    }
  }
}
