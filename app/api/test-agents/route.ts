import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Test the agents API using a relative URL
    const response = await fetch("/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Hello, this is a test message",
      }),
    })

    // Check if the response is valid
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to test agents API",
          status: response.status,
          statusText: response.statusText,
        },
        { status: 500 },
      )
    }

    // Try to parse the response as JSON
    try {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: "Agents API is working correctly",
        response: data,
      })
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse agents API response",
          details: parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing agents API:", error)
    return NextResponse.json(
      {
        error: "Failed to test agents API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
