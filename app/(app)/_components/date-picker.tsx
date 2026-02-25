"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { dateStrToLocal, localDateToStr } from "@/lib/utils/tz"

interface Props {
  value?: string | null
  onChange: (date: string | null) => void
  placeholder?: string
}

function formatDate(str: string): string {
  const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date())
  const [ty, tm, td] = todayStr.split("-").map(Number)
  const tomorrow = new Intl.DateTimeFormat("en-CA").format(
    new Date(ty, tm - 1, td + 1)
  )
  const yesterday = new Intl.DateTimeFormat("en-CA").format(
    new Date(ty, tm - 1, td - 1)
  )
  if (str === todayStr) return "Сегодня"
  if (str === tomorrow) return "Завтра"
  if (str === yesterday) return "Вчера"
  const [y, m, d] = str.split("-").map(Number)
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d, 12))
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Дата",
}: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !dropdownRef.current || !btnRef.current) return
    const dropdown = dropdownRef.current.getBoundingClientRect()
    const btn = btnRef.current.getBoundingClientRect()
    let top = btn.bottom + 4
    let left = btn.left
    if (top + dropdown.height > window.innerHeight - 8) {
      top = btn.top - dropdown.height - 4
    }
    if (left + dropdown.width > window.innerWidth - 8) {
      left = window.innerWidth - dropdown.width - 8
    }
    setPos({ top: Math.max(8, top), left: Math.max(8, left) })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (
        !ref.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date())
  const isOverdue = value ? value < todayStr : false

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPos({ top: rect.bottom + 4, left: rect.left })
          }
          setOpen((v) => !v)
        }}
        className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-colors cursor-pointer ${
          value
            ? isOverdue
              ? "border-red-200 text-red-500 bg-red-50 md:hover:bg-red-100"
              : "border-blue-200 text-blue-600 bg-blue-50 md:hover:bg-blue-100"
            : "border-gray-200 text-gray-400 md:hover:bg-gray-50"
        }`}
      >
        <span>📅</span>
        <span>{value ? formatDate(value) : placeholder}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
            className="bg-white rounded-xl border border-gray-200 shadow-xl p-1"
          >
            <DayPicker
              mode="single"
              selected={value ? dateStrToLocal(value) : undefined}
              onSelect={(date) => {
                onChange(date ? localDateToStr(date) : null)
                setOpen(false)
              }}
              style={
                {
                  "--rdp-accent-color": "#ef4444",
                  "--rdp-accent-background-color": "#fee2e2",
                } as React.CSSProperties
              }
              footer={
                value ? (
                  <div className="pt-1 pb-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(null)
                        setOpen(false)
                      }}
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      Убрать дату
                    </button>
                  </div>
                ) : undefined
              }
            />
          </div>,
          document.body
        )}
    </div>
  )
}
