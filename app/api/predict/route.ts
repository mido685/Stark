import { NextResponse } from "next/server"

export const runtime = "nodejs"

const API_URL = "https://mohamed1357-smart-ordering.hf.space/predict"
// Prefer setting this in env (PREDICT_API_KEY); falls back to provided key for now.
const API_KEY = process.env.PREDICT_API_KEY ?? "389eOkPCGhwzuTPjnpdHbYXfwoy_7pa1FFPEctgFb4FtfcRJG"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Log outgoing request
    console.log('=== API PROXY: Sending to upstream ===')
    console.log('URL:', API_URL)
    console.log('API Key (first 10 chars):', API_KEY.substring(0, 10) + '...')
    console.log('Request body:', JSON.stringify(body, null, 2))

    const upstreamResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Send key in both common formats in case the upstream expects one of them
        Authorization: `Bearer ${API_KEY}`,
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
      // Force server-side fetch (no caching, avoids CORS from the browser)
      cache: "no-store",
    })
    
    console.log('Upstream response status:', upstreamResponse.status, upstreamResponse.statusText)

    const text = await upstreamResponse.text()

    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: "استجابة غير صالحة من الخادم", raw: text },
        { status: 502 }
      )
    }

    if (!upstreamResponse.ok) {
      // Log server-side to help diagnose
      console.error("Upstream predict error", {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        text,
        data,
      })
      return NextResponse.json(
        {
          error: "تعذر جلب البيانات من الخادم",
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          details: data,
          raw: text,
        },
        { status: upstreamResponse.status }
      )
    }

    const payload = data as {
      item_name?: string
      recommended_order_quantity?: number
      generated_at?: string
      model_version?: string
    }

    // Log parsed response
    console.log('=== API PROXY: Parsed response ===')
    console.log('Item name:', payload.item_name)
    console.log('Recommended order quantity:', payload.recommended_order_quantity)
    console.log('Generated at:', payload.generated_at)
    console.log('Model version:', payload.model_version)

    // Return only the fields we need to display
    return NextResponse.json({
      item_name: payload.item_name,
      recommended_order_quantity: payload.recommended_order_quantity,
      generated_at: payload.generated_at,
      model_version: payload.model_version,
    })
  } catch (error) {
    console.error("Predict route error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء الاتصال بالخادم" },
      { status: 500 }
    )
  }
}

