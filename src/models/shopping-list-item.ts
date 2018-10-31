import { Good } from './models'

export interface ShoppingListItem {
  good: Good
  quantity: number
  price: number
  total: number
}