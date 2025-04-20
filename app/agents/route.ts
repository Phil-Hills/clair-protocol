import { type NextRequest, NextResponse } from "next/server"
import { executeAgentAction, processPrompt } from "@/lib/agents"

export const runtime = "nodejs"

// Create a wrapper function to ensure all responses are JSON
function safeJsonResponse(data: any, status = 200) {
  try {
    // Ensure we're returning a valid JSON object
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error("Error creating JSON response:", error)
    // Fallback to a simple JSON object if there's an error
    return NextResponse.json(
      {
        response: "An error occurred while processing your request.",
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return safeJsonResponse({ error: "Invalid request format", details: "Could not parse JSON body" }, 400)
    }

    const { prompt, agentId, action, payload } = body

    // Log the request for debugging
    console.log("Received request:", {
      prompt: prompt ? prompt.substring(0, 50) + "..." : undefined,
      agentId,
      action,
    })

    // If a prompt is provided, process it through the MCP
    if (prompt) {
      try {
        // Create a simple fallback response in case of errors
        const fallbackResponse = {
          response: `I received your message: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}", but I'm having trouble processing it right now.`,
          agent: {
            id: "clair",
            name: "Clair Core",
            description: "The master logic, routing, and memory core.",
            route: "/agents/ctrl",
            tools: ["memory", "router", "agents"],
            goals: ["user alignment", "command interpretation", "agent delegation"],
            active: true,
          },
          memoryNode: {
            id: `fallback_${Date.now()}`,
            type: "response",
            content: "Fallback response due to processing error.",
            connections: [],
            timestamp: Date.now(),
          },
        }

        try {
          console.log("Processing prompt:", prompt.substring(0, 50) + "...")
          const result = await processPrompt(prompt)
          console.log("Prompt processed successfully")
          return safeJsonResponse(result)
        } catch (promptError) {
          console.error("Error processing prompt:", promptError)
          // Return fallback response instead of error
          return safeJsonResponse(fallbackResponse)
        }
      } catch (error) {
        console.error("Unhandled error in prompt processing:", error)
        return safeJsonResponse({
          response: "I'm having trouble processing your request right now. Please try again later.",
          agent: {
            id: "clair",
            name: "Clair Core",
          },
        })
      }
    }

    // If an agent action is specified, execute it
    if (agentId && action) {
      try {
        console.log(`Executing agent action: ${action} for agent ${agentId}`)
        const result = await executeAgentAction({
          agentId,
          action,
          payload: payload || {},
          timestamp: Date.now(),
        })
        console.log("Agent action executed successfully")
        return safeJsonResponse(result)
      } catch (actionError) {
        console.error("Error executing agent action:", actionError)
        return safeJsonResponse({
          response: "I'm having trouble executing that action right now. Please try again later.",
          agent: {
            id: agentId,
          },
        })
      }
    }

    console.log("No valid prompt or action found in request")
    return safeJsonResponse({
      response: "I received your message but I'm not sure how to process it. Could you try again?",
      agent: {
        id: "clair",
        name: "Clair Core",
      },
    })
  } catch (error: any) {
    console.error("Error in agents API:", error)

    // Always return a valid JSON response
    return safeJsonResponse({
      response: "I'm having some technical difficulties right now. Please try again later.",
      agent: {
        id: "clair",
        name: "Clair Core",
      },
    })
  }
}
