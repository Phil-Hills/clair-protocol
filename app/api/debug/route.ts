import { NextResponse } from "next/server"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

export async function GET() {
  try {
    // Check environment
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      apiKeyStart: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 3) : "",
    }

    // Return environment info
    return NextResponse.json({
      success: true,
      environment,
      message: "Debug information retrieved successfully",
    })
  } catch (error: any) {
    console.error("Error in debug API:", error)

    // Return error as JSON
    return NextResponse.json(
      {
        error: "Debug API error",
        message: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
