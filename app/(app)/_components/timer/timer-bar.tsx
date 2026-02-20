"use client"

import { formatSeconds, useTimer } from "./timer-context"

export function TimerBar() {
  const { state, pause, resume, stop, setType } = useTimer()

  if (state.status === "idle") return null

  const isPomodoro = state.type === "pomodoro"
  const isRunning = state.status === "running"
  const progress = isPomodoro
    ? (state.workDuration - state.seconds) / state.workDuration
    : 0

  return (
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
          <span className="text-base">{isPomodoro ? "🍅" : "⏱"}</span>
          <span className="text-sm text-gray-600 truncate">
            {state.taskTitle}
          </span>
        </div>

        {/* Timer display */}
        <span
          className={`text-xl md:text-2xl font-mono font-semibold tabular-nums mx-3 md:mx-8 ${
            isRunning ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {formatSeconds(state.seconds)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Mode switcher — desktop only */}
          <div className="hidden md:flex rounded-lg border border-gray-200 overflow-hidden text-xs mr-1">
            <button
              onClick={() => setType("pomodoro")}
              disabled={isRunning}
              className={`px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed ${
                isPomodoro
                  ? "bg-red-500 text-white"
                  : "text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              🍅 25m
            </button>
            <button
              onClick={() => setType("stopwatch")}
              disabled={isRunning}
              className={`px-2.5 py-1.5 border-l border-gray-200 transition-colors disabled:cursor-not-allowed ${
                !isPomodoro
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              ⏱ Free
            </button>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={isRunning ? pause : resume}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label={isRunning ? "Pause" : "Resume"}
          >
            {isRunning ? "⏸" : "▶"}
          </button>

          {/* Stop & save */}
          <button
            onClick={stop}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
            aria-label="Stop and save"
          >
            ⏹
          </button>
        </div>
      </div>
    </div>
  )
}
