"use client"

import { useRef, useState } from "react"
import { Hourglass, Timer, Pause, Play, Square } from "lucide-react"
import { formatSeconds, useTimer } from "./timer-context"
import { TaskModal } from "../task-modal"
import { fetchTask } from "@/lib/actions/tasks"
import { useTaskStore } from "@/lib/stores/task-store"

function parseDisplayTime(input: string): number | null {
  const parts = input.trim().split(":").map((s) => parseInt(s, 10))
  if (parts.some(isNaN)) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return null
}

export function TimerBar() {
  const { state, pause, resume, stop, setType, adjust } = useTimer()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (state.status === "idle") return null

  const isPomodoro = state.type === "pomodoro"
  const isRunning = state.status === "running"
  const progress = isPomodoro
    ? (state.workDuration - state.seconds) / state.workDuration
    : 0

  function startEdit() {
    setEditValue(formatSeconds(state.seconds))
    setEditing(true)
    setTimeout(() => {
      inputRef.current?.select()
    }, 0)
  }

  function commitEdit() {
    const parsed = parseDisplayTime(editValue)
    if (parsed !== null && parsed >= 0) {
      const clamped = isPomodoro ? Math.min(parsed, state.workDuration) : parsed
      adjust(clamped)
    }
    setEditing(false)
  }

  return (
    <>
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-50">
      {/* Progress bar (pomodoro only) */}
      {isPomodoro && (
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full bg-red-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between px-3 md:px-6 h-14 max-w-5xl mx-auto w-full">
        {/* Task info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isPomodoro ? <Hourglass size={16} className="flex-shrink-0 text-red-500" /> : <Timer size={16} className="flex-shrink-0 text-gray-400" />}
          <button
            onClick={async () => {
              if (state.taskId && !useTaskStore.getState().tasks.find((t) => t.id === state.taskId)) {
                const task = await fetchTask(state.taskId)
                if (task) useTaskStore.getState().addTask(task)
              }
              setModalOpen(true)
            }}
            className="text-sm text-gray-600 truncate hover:text-gray-900 transition-colors cursor-pointer"
          >
            {state.taskTitle}
          </button>
        </div>

        {/* Timer display — click to edit */}
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit()
              if (e.key === "Escape") setEditing(false)
            }}
            className="text-xl md:text-2xl font-mono font-semibold tabular-nums mx-3 md:mx-8 w-24 bg-transparent outline-none border-b-2 border-gray-400 text-center text-gray-900"
          />
        ) : (
          <button
            onClick={startEdit}
            title="Click to edit"
            className={`text-xl md:text-2xl font-mono font-semibold tabular-nums mx-3 md:mx-8 cursor-text hover:opacity-60 transition-opacity ${
              isRunning ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {formatSeconds(state.seconds)}
          </button>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Mode switcher — desktop only */}
          <div className="hidden md:flex rounded-lg border border-gray-200 overflow-hidden text-xs mr-1">
            <button
              onClick={() => setType("pomodoro")}
              disabled={isRunning}
              className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed ${
                isPomodoro
                  ? "bg-red-500 text-white"
                  : "text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              <Hourglass size={11} /> 25m
            </button>
            <button
              onClick={() => setType("stopwatch")}
              disabled={isRunning}
              className={`flex items-center gap-1 px-2.5 py-1.5 border-l border-gray-200 transition-colors disabled:cursor-not-allowed ${
                !isPomodoro
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              <Timer size={11} /> Free
            </button>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={isRunning ? pause : resume}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label={isRunning ? "Pause" : "Resume"}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Stop & save */}
          <button
            onClick={stop}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
            aria-label="Stop and save"
          >
            <Square size={14} />
          </button>
        </div>
      </div>
    </div>

    {modalOpen && state.taskId && (
      <TaskModal taskId={state.taskId} onClose={() => setModalOpen(false)} />
    )}
  </>
  )
}
