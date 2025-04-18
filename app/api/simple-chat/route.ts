import { NextResponse } from "next/server"
import OpenAI from "openai"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

// Create an OpenAI API client (outside the handler to avoid recreating it on each request)
let openai: OpenAI

export async function POST(req: Request) {
  try {
    console.log("Simple chat API called")

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Initialize OpenAI client if not already done
    if (!openai) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }

    // Parse request body
    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    console.log("Sending message to OpenAI:", message)

    // Make a simple, non-streaming request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      max_tokens: 500,
    })

    const response = completion.choices[0].message.content
    console.log("Received response from OpenAI")

    // Return a simple JSON response
    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Error in simple-chat API:", error)

    // Return detailed error information
    return NextResponse.json(
      {
        error: "Failed to get response",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
