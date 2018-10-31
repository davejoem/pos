import { Commission, Employee, ShoppingListItem } from './models'

export interface Sale {
  _id: string
  cash: number
  change: number
  commission: Commission
  creditor?: string
  date: Date
  debt?: boolean
  employee: Employee
  list: ShoppingListItem[]
  total: number
}