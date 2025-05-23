import { PredictionServiceClient } from "@google-cloud/aiplatform"
import { helpers } from "@google-cloud/aiplatform/build/src/helpers"

const endpoint = "projects/671043622854/locations/us-west1/endpoints/3804112320011960320"

// Initialize the client
let predictionClient: PredictionServiceClient | null = null

function getClient(): PredictionServiceClient {
  if (!predictionClient) {
    try {
      predictionClient = new PredictionServiceClient()
    } catch (error) {
      console.error("Error initializing PredictionServiceClient:", error)
      throw new Error("Failed to initialize Flux client")
    }
  }
  return predictionClient
}

// Generate content using Flux with improved error handling
export async function generateFluxContent(prompt: string): Promise<any> {
  try {
    // Check if the client can be initialized
    let client
    try {
      client = getClient()
    } catch (clientError) {
      console.error("Error initializing Flux client:", clientError)
      return {
        error: "Failed to initialize Flux client",
        details: clientError instanceof Error ? clientError.message : "Unknown error",
      }
    }

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return {
        error: "Invalid prompt",
        details: "Prompt must be a non-empty string",
      }
    }

    const instance = {
      prompt,
    }

    try {
      // Use a timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 30000))

      const predictionPromise = client.predict({
        endpoint,
        instances: [helpers.toValue(instance)],
        parameters: helpers.toValue({}),
      })

      // Race the prediction against the timeout
      const [response] = (await Promise.race([
        predictionPromise,
        timeoutPromise.then(() => {
          throw new Error("Request timed out")
        }),
      ])) as [any]

      // Check if response is valid
      if (!response || !response.predictions) {
        return {
          error: "Invalid response from Flux",
          details: "The response did not contain predictions",
        }
      }

      return response.predictions
    } catch (predictionError) {
      console.error("Error making Flux prediction:", predictionError)

      // Check for specific error types
      if (predictionError instanceof Error) {
        if (predictionError.message.includes("timed out")) {
          return {
            error: "Request timed out",
            details: "The Flux service took too long to respond",
          }
        }

        if (predictionError.message.includes("RESOURCE_EXHAUSTED")) {
          return {
            error: "Resource limit exceeded",
            details: "The Flux service is currently overloaded",
          }
        }
      }

      return {
        error: "Failed to generate prediction",
        details: predictionError instanceof Error ? predictionError.message : "Unknown error",
      }
    }
  } catch (error) {
    console.error("Error generating Flux content:", error)
    // Return a structured error object instead of throwing
    return {
      error: "Failed to generate content",
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Check if the prompt is likely to generate an image
export function isImagePrompt(prompt: string): boolean {
  const imageKeywords = ["image", "picture", "photo", "draw", "generate", "create", "render", "visualize", "design"]

  return imageKeywords.some((keyword) => prompt.toLowerCase().includes(keyword))
}

// Process the Flux response
export function processFluxResponse(response: any): {
  type: "image" | "text"
  content: string
} {
  if (!response) {
    return {
      type: "text",
      content: "No response from Flux",
    }
  }

  // Handle error responses
  if (response.error) {
    return {
      type: "text",
      content: `Error: ${response.error}${response.details ? ` - ${response.details}` : ""}`,
    }
  }

  // Handle array response
  if (Array.isArray(response)) {
    const item = response[0]

    // Check if it's an object with image_url property
    if (typeof item === "object" && item.image_url) {
      return {
        type: "image",
        content: item.image_url,
      }
    }

    // Check if it's a string URL
    if (typeof item === "string" && (item.startsWith("http") || item.startsWith("data:"))) {
      return {
        type: "image",
        content: item,
      }
    }

    // Default to text
    return {
      type: "text",
      content: JSON.stringify(response),
    }
  }

  // Handle direct string URL
  if (typeof response === "string" && (response.startsWith("http") || response.startsWith("data:"))) {
    return {
      type: "image",
      content: response,
    }
  }

  // Handle object with image_url property
  if (typeof response === "object" && response.image_url) {
    return {
      type: "image",
      content: response.image_url,
    }
  }

  // Default to text
  return {
    type: "text",
    content: JSON.stringify(response),
  }
}
