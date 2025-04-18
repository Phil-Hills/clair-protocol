import { OpenAI } from "openai"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

export async function GET() {
  try {
    // Check if the API key is set
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create an OpenAI client with dangerouslyAllowBrowser option
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Add this option to address the error
    })

    // Make a simple API call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 50,
    })

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        message: "OpenAI API is working correctly",
        response: completion.choices[0].message.content,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    console.error("Error testing OpenAI API:", error)

    // Return a detailed error response
    return new Response(
      JSON.stringify({
        error: "OpenAI API error",
        message: error.message,
        status: error.status,
        details: error.response?.data || "No additional details",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
