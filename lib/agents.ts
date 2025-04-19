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

// Improve error handling in processPrompt function
export async function processPrompt(prompt: string): Promise<{
  response: string
  agent: Agent
  memoryNode: MemoryNode
}> {
  try {
    // Store the prompt in memory
    let promptNode
    try {
      promptNode = addMemoryNode({
        type: "prompt",
        content: prompt,
        connections: [],
      })
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
    const agent = routeRequest(prompt)

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
      switch (agent.id) {
        case "flux":
          try {
            const result = await generateFluxContent(prompt)
            response =
              typeof result === "string" ? result : `Generated content is available at: ${JSON.stringify(result)}`
          } catch (fluxError) {
            console.error("Error generating Flux content:", fluxError)
            response = "I encountered an error while generating content with Flux."
          }
          break

        case "memory":
          // Simple memory retrieval for now
          try {
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
          response = `I'm Clair, your AI assistant. I've processed your request: "${prompt}". How can I assist you further?`
          break
      }
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

    return {
      response,
      agent,
      memoryNode: responseNode,
    }
  } catch (error) {
    console.error("Error in processPrompt:", error)
    // Return a fallback response instead of throwing
    const fallbackAgent = getAgents().find((a) => a.id === "clair") || getAgents()[0]

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

// Execute an agent action
export async function executeAgentAction(action: AgentAction): Promise<any> {
  // Record the action in memory
  try {
    addMemoryNode({
      type: "decision",
      content: `Agent ${action.agentId} executed ${action.action}`,
      connections: [],
      metadata: {
        agentId: action.agentId,
        action: action.action,
        payload: action.payload,
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
          throw new Error(`Target agent ${action.payload.targetAgentId} not found`)
        }

        return executeAgentAction({
          agentId: targetAgent.id,
          action: action.payload.action,
          payload: action.payload.actionPayload,
          timestamp: Date.now(),
        })

      case "respond":
        // Just return the payload for a direct response
        return action.payload

      case "generate":
        return generateFluxContent(action.payload.prompt)

      case "store":
        // Store data in memory
        return addMemoryNode({
          type: action.payload.nodeType || "memory",
          content: action.payload.content,
          connections: action.payload.connections || [],
          metadata: action.payload.metadata,
        })

      default:
        throw new Error(`Unknown action type: ${action.action}`)
    }
  } catch (error) {
    console.error(`Error executing agent action ${action.action}:`, error)
    return {
      error: `Failed to execute ${action.action}`,
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
