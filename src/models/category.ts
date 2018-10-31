import { Good } from './models'

export interface Category {
  name: string
  goods?: Good[]
  expanded?: boolean
}