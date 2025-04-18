import { type NextRequest, NextResponse } from "next/server"
import { PredictionServiceClient } from "@google-cloud/aiplatform"
import { helpers } from "@google-cloud/aiplatform/build/src/helpers"

export const runtime = "nodejs"

const endpoint = "projects/671043622854/locations/us-west1/endpoints/3804112320011960320"

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  try {
    const client = new PredictionServiceClient()

    const instance = {
      prompt,
    }

    const [response] = await client.predict({
      endpoint,
      instances: [helpers.toValue(instance)],
      parameters: helpers.toValue({}),
    })

    return NextResponse.json({ result: response.predictions })
  } catch (error: any) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
