import { Employee } from './models'

export interface Payment {
  amount: number
  balance: number
  by: Employee
  date: string
  description: string
  isinvoice: boolean
  to: string
  paid: number
}