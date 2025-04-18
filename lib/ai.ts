export async function generate(prompt: string) {
  try {
    const response = await fetch("/api/flux", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate content")
    }

    const data = await response.json()
    return data.result
  } catch (error: any) {
    console.error("Error in generate function:", error)
    throw error
  }
}
