export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null
  estimatedDuration: number | null
}
