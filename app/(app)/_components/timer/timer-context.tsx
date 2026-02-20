"use client"

import { saveTimeLog } from "@/lib/actions/time-logs"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react"

export const WORK_DURATION = 25 * 60 // 25 min

export type TimerStatus = "idle" | "running" | "paused"
export type TimerType = "pomodoro" | "stopwatch"

export interface TimerState {
  status: TimerStatus
  type: TimerType
  taskId: string | null
  taskTitle: string | null
  startTime: Date | null
  seconds: number
  workDuration: number
}

// ─── localStorage persistence ─────────────────────────────────────────────────

const STORAGE_KEY = "todo_timer_session"

interface PersistedTimer {
  taskId: string
  taskTitle: string
  type: TimerType
  startTime: string // ISO
  workDuration: number
}

function persistTimer(data: PersistedTimer) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function clearPersistedTimer() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function loadPersistedTimer(): PersistedTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedTimer) : null
  } catch {
    return null
  }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | {
      type: "START"
      taskId: string
      taskTitle: string
      timerType: TimerType
      workDuration: number
      startTime: Date
    }
  | { type: "RESTORE"; state: TimerState }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK" }
  | { type: "RESET" }
  | { type: "SET_TYPE"; timerType: TimerType }

function initState(workDuration = WORK_DURATION): TimerState {
  return {
    status: "idle",
    type: "pomodoro",
    taskId: null,
    taskTitle: null,
    startTime: null,
    seconds: workDuration,
    workDuration,
  }
}

function reducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        status: "running",
        taskId: action.taskId,
        taskTitle: action.taskTitle,
        type: action.timerType,
        startTime: action.startTime,
        seconds:
          action.timerType === "pomodoro" ? action.workDuration : 0,
        workDuration: action.workDuration,
      }
    case "RESTORE":
      return action.state
    case "PAUSE":
      return { ...state, status: "paused" }
    case "RESUME":
      return { ...state, status: "running" }
    case "TICK":
      if (state.type === "pomodoro") {
        return { ...state, seconds: Math.max(0, state.seconds - 1) }
      }
      return { ...state, seconds: state.seconds + 1 }
    case "RESET":
      return initState(state.workDuration)
    case "SET_TYPE":
      return {
        ...state,
        type: action.timerType,
        seconds:
          action.timerType === "pomodoro" ? state.workDuration : 0,
      }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TimerContextValue {
  state: TimerState
  start: (taskId: string, taskTitle: string, type: TimerType) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => Promise<void>
  setType: (type: TimerType) => void
}

const TimerContext = createContext<TimerContextValue | null>(null)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  const stateRef = useRef(state)
  stateRef.current = state

  // ── Restore from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    const persisted = loadPersistedTimer()
    if (!persisted) return

    const startTime = new Date(persisted.startTime)
    const elapsedSec = Math.floor((Date.now() - startTime.getTime()) / 1000)

    if (persisted.type === "pomodoro") {
      const remaining = persisted.workDuration - elapsedSec

      if (remaining <= 0) {
        // Pomodoro finished while away — save the full session log
        saveTimeLog({
          taskId: persisted.taskId,
          startTime,
          duration: persisted.workDuration,
          type: "pomodoro",
        }).catch(() => {})
        clearPersistedTimer()
        return
      }

      dispatch({
        type: "RESTORE",
        state: {
          status: "running",
          type: "pomodoro",
          taskId: persisted.taskId,
          taskTitle: persisted.taskTitle,
          startTime,
          seconds: remaining,
          workDuration: persisted.workDuration,
        },
      })
    } else {
      // Stopwatch — restore with elapsed time
      dispatch({
        type: "RESTORE",
        state: {
          status: "running",
          type: "stopwatch",
          taskId: persisted.taskId,
          taskTitle: persisted.taskTitle,
          startTime,
          seconds: elapsedSec,
          workDuration: persisted.workDuration,
        },
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tick ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.status !== "running") return
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000)
    return () => clearInterval(id)
  }, [state.status])

  // ── Stop & save ─────────────────────────────────────────────────────────────
  const stop = useCallback(async () => {
    const s = stateRef.current
    if (s.taskId && s.startTime && s.status !== "idle") {
      const duration =
        s.type === "pomodoro" ? s.workDuration - s.seconds : s.seconds
      if (duration >= 1) {
        await saveTimeLog({
          taskId: s.taskId,
          startTime: s.startTime,
          duration,
          type: s.type,
        })
      }
    }
    clearPersistedTimer()
    dispatch({ type: "RESET" })
  }, [])

  // ── Auto-complete pomodoro ───────────────────────────────────────────────────
  useEffect(() => {
    if (
      state.type === "pomodoro" &&
      state.status === "running" &&
      state.seconds === 0
    ) {
      stop()
    }
  }, [state.seconds, state.type, state.status, stop])

  // ── Start ────────────────────────────────────────────────────────────────────
  const start = useCallback(
    async (taskId: string, taskTitle: string, timerType: TimerType) => {
      if (stateRef.current.status !== "idle") {
        await stop()
      }
      const startTime = new Date()
      const { workDuration } = stateRef.current

      persistTimer({ taskId, taskTitle, type: timerType, startTime: startTime.toISOString(), workDuration })

      dispatch({ type: "START", taskId, taskTitle, timerType, workDuration, startTime })
    },
    [stop]
  )

  const pause = useCallback(() => dispatch({ type: "PAUSE" }), [])
  const resume = useCallback(() => dispatch({ type: "RESUME" }), [])
  const setType = useCallback(
    (timerType: TimerType) => dispatch({ type: "SET_TYPE", timerType }),
    []
  )

  return (
    <TimerContext.Provider value={{ state, start, pause, resume, stop, setType }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error("useTimer must be inside TimerProvider")
  return ctx
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60).toString().padStart(2, "0")
  const s = (total % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}
