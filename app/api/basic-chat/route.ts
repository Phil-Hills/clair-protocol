import { NextResponse } from "next/server"
import OpenAI from "openai"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Create an OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log(
      "Sending request to OpenAI with messages:",
      messages.map((msg: any) => ({ role: msg.role, content: msg.content.substring(0, 50) + "..." })),
    )

    try {
      // Make a non-streaming request to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      })

      // Extract the response
      const responseMessage = completion.choices[0].message

      // Return a simple JSON response
      return NextResponse.json({
        role: responseMessage.role,
        content: responseMessage.content,
      })
    } catch (openaiError: any) {
      console.error("OpenAI API specific error:", openaiError)

      // Return a more detailed error for OpenAI-specific issues
      return NextResponse.json(
        {
          error: "OpenAI API error",
          message: openaiError.message || "Unknown OpenAI error",
          details: openaiError.response?.data || "No additional details",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in basic-chat API:", error)

    // Return detailed error information as JSON
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
