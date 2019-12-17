interface NCResponse<T> {
  status: boolean,
  data?: T,
  errMessage?: string
  errCode?: number
}

interface BaseModel {
  id: number,
  createdAt: string,
  updatedAt: string
}

interface Category extends BaseModel {
  name: string
  description: string
}

interface SubCategory extends BaseModel {
  name: string
  description: string,
  categoryId: number
}

interface Picture extends BaseModel {
  url: string
}
