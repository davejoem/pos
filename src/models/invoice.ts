import { Employee } from './models'

export interface Invoice {
  amount: number
  by: Employee
  date: string
  description: string
  to: string
}