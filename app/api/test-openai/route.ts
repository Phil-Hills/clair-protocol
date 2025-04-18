import { openai } from "@ai-sdk/openai"

// Explicitly set the runtime for this route
export const runtime = "nodejs"

export async function GET() {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Test the OpenAI API with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 50,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "OpenAI API is working correctly",
        response: completion.choices[0].message.content,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Error testing OpenAI API:", error)
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during the OpenAI API test",
        details: error.response?.data || error,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
