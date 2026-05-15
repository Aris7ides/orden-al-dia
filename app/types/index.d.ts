export type Tag = {
  id: string
  name: string
  color: string | null
  defaultRate: number | null
  createdAt?: string
}

export type Evento = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  hourlyRate: number | null
  totalAmount: number | null
  tagId: string | null
  tag: Tag | null
}