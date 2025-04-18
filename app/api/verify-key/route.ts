import { NextResponse } from "next/server"
import OpenAI from "openai"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is not set",
          environment: {
            nodeEnv: process.env.NODE_ENV,
          },
        },
        { status: 500 },
      )
    }

    // Create an OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Make a simple API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 10,
    })

    // Return the result
    return NextResponse.json({
      success: true,
      message: "OpenAI API is working correctly",
      response: completion.choices[0].message.content,
    })
  } catch (error: any) {
    console.error("Error testing OpenAI API:", error)

    // Return detailed error information
    return NextResponse.json(
      {
        error: "OpenAI API error",
        message: error.message,
        status: error.status,
        details: error.response?.data || "No additional details",
      },
      { status: 500 },
    )
  }
}
