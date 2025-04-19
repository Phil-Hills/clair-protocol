import { type NextRequest, NextResponse } from "next/server"
import { executeAgentAction, processPrompt } from "@/lib/agents"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        { error: "Invalid request format", details: "Could not parse JSON body" },
        { status: 400 },
      )
    }

    const { prompt, agentId, action, payload } = body

    // If a prompt is provided, process it through the MCP
    if (prompt) {
      try {
        const result = await processPrompt(prompt)
        return NextResponse.json(result)
      } catch (promptError) {
        console.error("Error processing prompt:", promptError)
        return NextResponse.json(
          {
            error: "Failed to process prompt",
            details: promptError instanceof Error ? promptError.message : "Unknown error",
            stack:
              process.env.NODE_ENV === "development"
                ? promptError instanceof Error
                  ? promptError.stack
                  : undefined
                : undefined,
          },
          { status: 500 },
        )
      }
    }

    // If an agent action is specified, execute it
    if (agentId && action) {
      try {
        const result = await executeAgentAction({
          agentId,
          action,
          payload: payload || {},
          timestamp: Date.now(),
        })
        return NextResponse.json(result)
      } catch (actionError) {
        console.error("Error executing agent action:", actionError)
        return NextResponse.json(
          {
            error: "Failed to execute agent action",
            details: actionError instanceof Error ? actionError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      { error: "Invalid request. Provide either 'prompt' or 'agentId' and 'action'." },
      { status: 400 },
    )
  } catch (error: any) {
    console.error("Error in agents API:", error)

    // Ensure we always return a properly formatted JSON response
    return NextResponse.json(
      {
        error: "Failed to process agent request",
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
