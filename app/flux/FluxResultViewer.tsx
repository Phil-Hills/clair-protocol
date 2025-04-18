"use client"

export default function FluxResultViewer({ result }: { result: any }) {
  const content = Array.isArray(result) ? result[0] : result

  if (typeof content === "string" && content.startsWith("http")) {
    return (
      <div className="mt-4">
        <img src={content || "/placeholder.svg"} alt="Generated result" className="rounded-lg shadow-lg" />
      </div>
    )
  }

  return <pre className="bg-gray-900 p-4 rounded-md mt-4 whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
}
