"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"

interface InventoryFormProps {
  onSubmit: (data: {
    item_name: string
    current_balance: number
    consumption: number
    cogs: number
  }) => void
}

export default function InventoryForm({ onSubmit }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    item_name: "",
    current_balance: "",
    consumption: "",
    cogs: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.item_name.trim()) {
      newErrors.item_name = "اسم المنتج مطلوب"
    }
    const currentBalance = Number.parseFloat(formData.current_balance)
    if (!formData.current_balance || Number.isNaN(currentBalance) || currentBalance < 0) {
      newErrors.current_balance = "الرصيد الحالي يجب أن يكون صفر أو أكبر"
    } else if (currentBalance > 100000) {
      newErrors.current_balance = "الرصيد الحالي يجب ألا يزيد عن 100000"
    }
    const consumption = Number.parseFloat(formData.consumption)
    if (!formData.consumption || Number.isNaN(consumption) || consumption <= 0) {
      newErrors.consumption = "الاستهلاك يجب أن يكون رقمًا أكبر من صفر"
    }
    const cogs = Number.parseFloat(formData.cogs)
    if (!formData.cogs || Number.isNaN(cogs) || cogs <= 0) {
      newErrors.cogs = "تكلفة البضاعة المباعة يجب أن تكون رقمًا أكبر من صفر"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    await onSubmit({
      item_name: formData.item_name,
      current_balance: Number.parseFloat(formData.current_balance),
      consumption: Number.parseFloat(formData.consumption),
      cogs: Number.parseFloat(formData.cogs),
    })

    setIsLoading(false)

    setFormData({
      item_name: "",
      current_balance: "",
      consumption: "",
      cogs: "",
    })
  }

  return (
    <div className="h-full">
      <form
        onSubmit={handleSubmit}
        className="relative h-full rounded-3xl border border-cyan-400/40 bg-slate-950/70 text-slate-50 shadow-[0_0_40px_rgba(34,211,238,0.35)] backdrop-blur-2xl overflow-hidden group"
      >
        {/* neon border glow */}
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
        </div>

        {/* ─── Loading overlay ─── */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 rounded-3xl bg-slate-950/80 backdrop-blur-sm">
            {/* spinning ring behind logo */}
            <div className="relative flex items-center justify-center">
              {/* outer spinning ring */}
              <div className="absolute h-32 w-32 rounded-full border-2 border-transparent border-t-cyan-400 border-r-fuchsia-500 animate-spin" />
              {/* mid ring slower */}
              <div
                className="absolute h-24 w-24 rounded-full border-2 border-transparent border-b-sky-400 border-l-cyan-300"
                style={{ animation: "spin 2s linear infinite reverse" }}
              />
              {/* logo in center */}
              <Image
                src="/logo.gif"
                alt="STARK AI"
                width={72}
                height={72}
                className="rounded-full relative z-10"
                unoptimized
                priority
              />
            </div>

            {/* pulsing dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-cyan-400"
                  style={{
                    animation: "pulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/70 animate-pulse">
              Calculating...
            </p>
          </div>
        )}

        <div className="relative z-10 p-4 lg:p-10 h-full flex flex-col">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70 mb-2">
              Inventory Input
            </p>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
              Item Configuration
            </h2>
            <div className="mt-3 h-px w-20 bg-gradient-to-r from-cyan-400 via-sky-400 to-transparent" />
          </div>

          <div className="space-y-5 flex-1">
            {/* Item Name */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-wide uppercase text-slate-400 mb-2">
                Item Name
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                placeholder="Honey"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-300/80 transition-all duration-300 disabled:opacity-40 ${
                  errors.item_name ? "border-red-400/80 focus:ring-red-400/60" : "border-slate-700/80"
                }`}
              />
              {errors.item_name && <p className="text-sm text-red-400 mt-1 animate-fadeInUp">{errors.item_name}</p>}
            </div>

            {/* Current Balance */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-wide uppercase text-slate-400 mb-2">
                Current Balance
              </label>
              <input
                type="number"
                name="current_balance"
                value={formData.current_balance}
                onChange={handleChange}
                placeholder="1,250 units"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-300/80 transition-all duration-300 disabled:opacity-40 ${
                  errors.current_balance ? "border-red-400/80 focus:ring-red-400/60" : "border-slate-700/80"
                }`}
              />
              {errors.current_balance && <p className="text-sm text-red-400 mt-1 animate-fadeInUp">{errors.current_balance}</p>}
            </div>

            {/* Consumption */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-wide uppercase text-slate-400 mb-2">
                Consumption
              </label>
              <input
                type="number"
                name="consumption"
                value={formData.consumption}
                onChange={handleChange}
                placeholder="300 units / month"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-300/80 transition-all duration-300 disabled:opacity-40 ${
                  errors.consumption ? "border-red-400/80 focus:ring-red-400/60" : "border-slate-700/80"
                }`}
              />
              {errors.consumption && <p className="text-sm text-red-400 mt-1 animate-fadeInUp">{errors.consumption}</p>}
            </div>

            {/* COGS */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-wide uppercase text-slate-400 mb-2">
                COGS (Cost of Goods Sold)
              </label>
              <input
                type="number"
                name="cogs"
                value={formData.cogs}
                onChange={handleChange}
                placeholder="$75 / unit"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:border-cyan-300/80 transition-all duration-300 disabled:opacity-40 ${
                  errors.cogs ? "border-red-400/80 focus:ring-red-400/60" : "border-slate-700/80"
                }`}
              />
              {errors.cogs && <p className="text-sm text-red-400 mt-1 animate-fadeInUp">{errors.cogs}</p>}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold tracking-wide text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.55)] transition-transform duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Image
                    src="/logo.gif"
                    alt="loading"
                    width={20}
                    height={20}
                    className="rounded-full"
                    unoptimized
                  />
                  Processing...
                </span>
              ) : (
                <span>Calculate Recommended Order</span>
              )}
            </span>
          </button>

          <p className="mt-4 text-[11px] text-slate-400/80 text-center">
            Data is securely sent to the forecasting engine to compute optimal order quantity.
          </p>
        </div>
      </form>
    </div>
  )
}
