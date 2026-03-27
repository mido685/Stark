"use client"

import InventoryForm from "@/components/inventory-form"
import ResultsCard from "@/components/results-card"
import { useState } from "react"
import Image from "next/image"

export default function Home() {
  const [results, setResults] = useState<{
    item_name: string
    recommended_order_quantity: number
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ✅ must return a Promise so InventoryForm knows when to stop loading
  const handleFormSubmit = async (data: {
    item_name: string
    current_balance: number
    consumption: number
    cogs: number
  }): Promise<void> => {
    try {
      setErrorMessage(null)

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const responseText = await response.text()
        let errorDetails: unknown = null

        try {
          errorDetails = JSON.parse(responseText)
        } catch {
          errorDetails = responseText || null
        }

        let friendlyMessage = `خطأ ${response.status}: ${response.statusText || 'تعذر الاتصال بالخادم'}`

        if (typeof errorDetails === 'object' && errorDetails !== null) {
          const err = errorDetails as { error?: unknown; detail?: unknown; details?: { detail?: unknown } }

          if (typeof err.error === 'string') {
            friendlyMessage = err.error
          }

          let detailArray: unknown[] | undefined
          if (Array.isArray(err.detail)) {
            detailArray = err.detail
          } else if (err.details && typeof err.details === 'object' && err.details !== null) {
            const details = err.details as { detail?: unknown }
            if (Array.isArray(details.detail)) {
              detailArray = details.detail as unknown[]
            }
          }

          if (Array.isArray(detailArray) && detailArray.length > 0) {
            const msgs = (detailArray as Array<Record<string, unknown>>)
              .map((d) => {
                if (typeof d.msg === 'string') return d.msg
                if (typeof d.message === 'string') return d.message
                return null
              })
              .filter((m): m is string => m !== null)
            if (msgs.length > 0) friendlyMessage = msgs.join(' | ')
          }
        } else if (typeof errorDetails === 'string' && errorDetails.trim()) {
          friendlyMessage = errorDetails
        }

        setErrorMessage(friendlyMessage)
        setResults(null)
        return
      }

      const result = await response.json()

      if (!result.item_name || result.recommended_order_quantity === undefined) {
        setErrorMessage('الاستجابة من الخادم غير مكتملة')
        setResults(null)
        return
      }

      setResults({
        item_name: result.item_name,
        recommended_order_quantity: result.recommended_order_quantity,
      })
      setErrorMessage(null)

    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.')
    }
    // ✅ promise always resolves here — loading stops whether success, error, or exception
  }

  return (
    <main className="min-h-screen overflow-hidden relative">
      <div className="background-animated" />

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-green-100 to-green-200 opacity-8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-gradient-to-br from-emerald-100 to-green-200 opacity-8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-green-50 to-emerald-100 opacity-6 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 gap-8">

        {/* ─── Animated Logo ─── */}
        <div className="animate-fadeInDown flex flex-col items-center gap-3">
          <div className="animate-glow rounded-full p-1">
            <Image
              src="/logo.gif"
              alt="STARK AI Logo"
              width={110}
              height={110}
              className="rounded-full animate-scaleIn"
              priority
              unoptimized
            />
          </div>
          <div className="text-center animate-fadeInUp">
            <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-lg">
              STARK <span className="text-green-400">AI</span>
            </h1>
            <p className="text-sm text-white/60 tracking-wider mt-0.5">
              Smart Order System
            </p>
          </div>
        </div>

        {/* ─── Cards ─── */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="animate-slideInLeft">
            <InventoryForm onSubmit={handleFormSubmit} />
          </div>
          <div className="animate-slideInRight">
            <ResultsCard results={results} errorMessage={errorMessage} />
          </div>
        </div>

      </div>
    </main>
  )
}
