export interface Good {
  brand?: string
  category: string
  code: string
  commission: number
  description?: string
  expires?: string
  name: string
  packages?: string[]
  sellingprice: number
  buyingprice: number
  sold?: number
  stock: number
}