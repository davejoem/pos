import { Sale } from './models'

export interface Employee {
  username: string
  password?: string
  role: string
  sales: Sale[]
}