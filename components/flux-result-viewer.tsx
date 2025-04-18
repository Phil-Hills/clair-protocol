"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface FluxResultViewerProps {
  result: any
}

export function FluxResultViewer({ result }: FluxResultViewerProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    // Extract image URLs from the result if they exist
    if (result && Array.isArray(result)) {
      const urls = result.filter((item) => typeof item === "object" && item.image_url).map((item) => item.image_url)

      setImageUrls(urls)
    }
  }, [result])

  if (!result) return null

  return (
    <div className="space-y-4">
      {imageUrls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {imageUrls.map((url, index) => (
            <Card key={index} className="overflow-hidden bg-slate-800 border-slate-700">
              <img
                src={url || "/placeholder.svg"}
                alt={`Generated image ${index + 1}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-4 overflow-auto max-h-[400px]">
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
