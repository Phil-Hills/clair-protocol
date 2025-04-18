"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FluxResultViewer({ result }: { result: any }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Handle different result formats
  const getImageUrl = () => {
    if (!result) return null

    // Handle array format
    if (Array.isArray(result)) {
      const item = result[0]
      // Check if it's an object with image_url property
      if (typeof item === "object" && item.image_url) {
        return item.image_url
      }
      // Check if it's a string URL
      if (typeof item === "string" && (item.startsWith("http") || item.startsWith("data:"))) {
        return item
      }
    }

    // Handle direct string URL
    if (typeof result === "string" && (result.startsWith("http") || result.startsWith("data:"))) {
      return result
    }

    // Handle object with image_url property
    if (typeof result === "object" && result.image_url) {
      return result.image_url
    }

    return null
  }

  const imageUrl = getImageUrl()

  const handleDownload = () => {
    if (!imageUrl) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `flux-generation-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (imageUrl) {
    return (
      <div className="mt-4 relative">
        <div
          className={`rounded-lg overflow-hidden bg-gray-800 ${!isImageLoaded ? "min-h-[300px] flex items-center justify-center" : ""}`}
        >
          {!isImageLoaded && (
            <div className="text-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-400">Loading image...</p>
            </div>
          )}
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Generated image"
            className={`w-full h-auto rounded-lg shadow-lg ${!isImageLoaded ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        <Button
          onClick={handleDownload}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
          size="sm"
        >
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>
    )
  }

  // Fallback to JSON display
  return (
    <pre className="bg-gray-900 p-4 rounded-md mt-4 whitespace-pre-wrap overflow-auto max-h-[500px]">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}
