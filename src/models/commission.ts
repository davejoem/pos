import { Employee, Sale } from './models'

export interface Commission {
  _id: string
  amount: number
  date: Date
  employee: Employee
  sale: Sale
}