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

export const WORK_DURATION = 25 * 60

export type TimerStatus = "idle" | "running" | "paused"
export type TimerType = "pomodoro" | "stopwatch"

export interface TimerState {
  status: TimerStatus
  type: TimerType
  taskId: string | null
  taskTitle: string | null
  // startTime is adjusted on resume so that (Date.now() - startTime)
  // always equals total ACTIVE elapsed time
  startTime: Date | null
  pausedAt: Date | null
  seconds: number
  workDuration: number
  timedOutTask: string | null
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "todo_timer_session"

interface PersistedTimer {
  taskId: string
  taskTitle: string
  type: TimerType
  startTime: string   // ISO — adjusted for pauses
  pausedAt?: string   // ISO — set when paused
  workDuration: number
}

function persistTimer(data: PersistedTimer) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function clearPersistedTimer() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

function loadPersistedTimer(): PersistedTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedTimer) : null
  } catch { return null }
}

function updatePersistedTimer(patch: Partial<PersistedTimer>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...JSON.parse(raw), ...patch }))
  } catch {}
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "START"; taskId: string; taskTitle: string; timerType: TimerType; workDuration: number; startTime: Date }
  | { type: "RESTORE"; state: TimerState }
  | { type: "PAUSE"; pausedAt: Date }
  | { type: "RESUME"; newStartTime: Date }
  | { type: "TICK" }
  | { type: "RESET" }
  | { type: "SET_TYPE"; timerType: TimerType }
  | { type: "SET_TIMEOUT_NOTIFICATION"; taskTitle: string }
  | { type: "DISMISS_NOTIFICATION" }

function initState(workDuration = WORK_DURATION): TimerState {
  return {
    status: "idle",
    type: "pomodoro",
    taskId: null,
    taskTitle: null,
    startTime: null,
    pausedAt: null,
    seconds: workDuration,
    workDuration,
    timedOutTask: null,
  }
}

function computeSeconds(state: TimerState): number {
  if (!state.startTime) return state.seconds
  const elapsed = Math.floor((Date.now() - state.startTime.getTime()) / 1000)
  if (state.type === "pomodoro") return Math.max(0, state.workDuration - elapsed)
  return elapsed
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
        pausedAt: null,
        seconds: action.timerType === "pomodoro" ? action.workDuration : 0,
        workDuration: action.workDuration,
        timedOutTask: null,
      }
    case "RESTORE":
      return action.state
    case "PAUSE":
      return { ...state, status: "paused", pausedAt: action.pausedAt }
    case "RESUME":
      return { ...state, status: "running", startTime: action.newStartTime, pausedAt: null }
    case "TICK":
      if (state.status !== "running" || !state.startTime) return state
      return { ...state, seconds: computeSeconds(state) }
    case "RESET":
      return initState(state.workDuration)
    case "SET_TYPE":
      return {
        ...state,
        type: action.timerType,
        seconds: action.timerType === "pomodoro" ? state.workDuration : 0,
      }
    case "SET_TIMEOUT_NOTIFICATION":
      return { ...initState(state.workDuration), timedOutTask: action.taskTitle }
    case "DISMISS_NOTIFICATION":
      return { ...state, timedOutTask: null }
    default:
      return state
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDuration(s: TimerState): number {
  if (!s.startTime) return 0
  const refTime = s.pausedAt ?? new Date()
  const elapsed = Math.floor((refTime.getTime() - s.startTime.getTime()) / 1000)
  return s.type === "pomodoro" ? Math.min(s.workDuration, elapsed) : elapsed
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TimerContextValue {
  state: TimerState
  start: (taskId: string, taskTitle: string, type: TimerType) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => Promise<void>
  setType: (type: TimerType) => void
  dismissNotification: () => void
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
    const pausedAt = persisted.pausedAt ? new Date(persisted.pausedAt) : null

    // If running (not paused) for more than 24 hours, stop automatically
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
    if (!pausedAt && Date.now() - startTime.getTime() > TWENTY_FOUR_HOURS) {
      clearPersistedTimer()
      dispatch({ type: "SET_TIMEOUT_NOTIFICATION", taskTitle: persisted.taskTitle })
      return
    }

    const refTime = pausedAt ?? new Date()
    const elapsed = Math.floor((refTime.getTime() - startTime.getTime()) / 1000)

    if (persisted.type === "pomodoro") {
      const remaining = persisted.workDuration - elapsed

      if (remaining <= 0 && !pausedAt) {
        // Pomodoro finished while tab was closed/sleeping
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
          status: pausedAt ? "paused" : "running",
          type: "pomodoro",
          taskId: persisted.taskId,
          taskTitle: persisted.taskTitle,
          startTime,
          pausedAt,
          seconds: Math.max(0, remaining),
          workDuration: persisted.workDuration,
          timedOutTask: null,
        },
      })
    } else {
      dispatch({
        type: "RESTORE",
        state: {
          status: pausedAt ? "paused" : "running",
          type: "stopwatch",
          taskId: persisted.taskId,
          taskTitle: persisted.taskTitle,
          startTime,
          pausedAt,
          seconds: elapsed,
          workDuration: persisted.workDuration,
          timedOutTask: null,
        },
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tick (wall-clock based) ──────────────────────────────────────────────────
  useEffect(() => {
    if (state.status !== "running") return
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000)
    return () => clearInterval(id)
  }, [state.status])

  // ── Stop & save ──────────────────────────────────────────────────────────────
  const stop = useCallback(async () => {
    const s = stateRef.current
    if (s.taskId && s.startTime && s.status !== "idle") {
      const duration = calcDuration(s)
      if (duration >= 1) {
        await saveTimeLog({ taskId: s.taskId, startTime: s.startTime, duration, type: s.type })
      }
    }
    clearPersistedTimer()
    dispatch({ type: "RESET" })
  }, [])

  // ── Auto-complete pomodoro ───────────────────────────────────────────────────
  useEffect(() => {
    if (state.type === "pomodoro" && state.status === "running" && state.seconds === 0) {
      stop()
    }
  }, [state.seconds, state.type, state.status, stop])

  // ── Dismiss timeout notification ─────────────────────────────────────────────
  const dismissNotification = useCallback(() => {
    dispatch({ type: "DISMISS_NOTIFICATION" })
  }, [])

  // ── Start ────────────────────────────────────────────────────────────────────
  const start = useCallback(
    async (taskId: string, taskTitle: string, timerType: TimerType) => {
      if (stateRef.current.status !== "idle") await stop()
      const startTime = new Date()
      const { workDuration } = stateRef.current
      persistTimer({ taskId, taskTitle, type: timerType, startTime: startTime.toISOString(), workDuration })
      dispatch({ type: "START", taskId, taskTitle, timerType, workDuration, startTime })
    },
    [stop]
  )

  // ── Pause ────────────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    const pausedAt = new Date()
    dispatch({ type: "PAUSE", pausedAt })
    updatePersistedTimer({ pausedAt: pausedAt.toISOString() })
  }, [])

  // ── Resume ───────────────────────────────────────────────────────────────────
  const resume = useCallback(() => {
    const s = stateRef.current
    if (!s.pausedAt || !s.startTime) return
    // Shift startTime forward by pause duration so elapsed stays accurate
    const pauseDuration = Date.now() - s.pausedAt.getTime()
    const newStartTime = new Date(s.startTime.getTime() + pauseDuration)
    dispatch({ type: "RESUME", newStartTime })
    updatePersistedTimer({ startTime: newStartTime.toISOString(), pausedAt: undefined })
  }, [])

  const setType = useCallback(
    (timerType: TimerType) => dispatch({ type: "SET_TYPE", timerType }),
    []
  )

  return (
    <TimerContext.Provider value={{ state, start, pause, resume, stop, setType, dismissNotification }}>
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
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0")
  const s = (total % 60).toString().padStart(2, "0")
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}
