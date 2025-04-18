import { OpenAI } from "openai"
import { StreamingTextResponse, OpenAIStream } from "ai"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Extract the messages from the request
    const { messages } = await req.json()

    // Ensure we have the API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Initialize the OpenAI client with the API key and dangerouslyAllowBrowser option
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Add this option to address the error
    })

    // Create the completion
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: messages.map((message: any) => ({
        role: message.role,
        content: message.content,
      })),
    })

    // Convert the response to a streaming response
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("OpenAI API error:", error)

    // Return a detailed error response
    return new Response(
      JSON.stringify({
        error: "OpenAI API error",
        message: error.message || "Unknown error",
        status: error.status || 500,
        details: error.response?.data || "No additional details",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
