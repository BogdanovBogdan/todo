import { create } from "zustand"
import * as actions from "@/lib/actions/tasks"
import type { Task } from "@/lib/types/task"

interface TaskStore {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  toggleTask: (id: string, completed: boolean) => void
  updateTitle: (id: string, title: string) => void
  updateDescription: (id: string, description: string | null) => void
  updateDueDate: (id: string, dueDate: string | null) => void
  updateEstimate: (id: string, estimatedDuration: number | null) => void
  deleteTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  toggleTask: (id, completed) => {
    const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date())
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== id) return t
        const dueDate =
          completed && t.dueDate && t.dueDate < todayStr ? todayStr : t.dueDate
        return { ...t, completed, dueDate }
      }),
    }))
    actions.toggleTask(id, completed, completed ? todayStr : undefined)
  },
  updateTitle: (id, title) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, title } : t) }))
    actions.updateTaskTitle(id, title)
  },
  updateDescription: (id, description) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, description } : t) }))
    actions.updateTaskDescription(id, description)
  },
  updateDueDate: (id, dueDate) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, dueDate } : t) }))
    actions.updateTaskDueDate(id, dueDate)
  },
  updateEstimate: (id, estimatedDuration) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, estimatedDuration } : t) }))
    actions.updateTaskEstimate(id, estimatedDuration)
  },
  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    actions.deleteTask(id)
  },
}))
