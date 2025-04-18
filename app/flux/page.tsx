"use client"

import type React from "react"

import { useState } from "react"
import FluxResultViewer from "./FluxResultViewer"

export default function FluxPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError("")

    try {
      const res = await fetch("/api/flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Unknown error")
      } else {
        setResult(data.result)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">🧠 Flux Generation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. glowing techno angel surfing lava"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-semibold"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {error && <p className="text-red-400 mt-4">{error}</p>}
      {result && (
        <div className="mt-8">
          <FluxResultViewer result={result} />
        </div>
      )}
    </div>
  )
}
