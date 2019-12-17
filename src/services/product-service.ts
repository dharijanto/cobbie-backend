import CRUDService from './crud-service'
import * as Promise from 'bluebird'

class ProductService extends CRUDService {
  getCategory (searchClause: Partial<Category>) {
    return super.readOne('Category', searchClause)
  }

  getCategories (searchClause: Partial<Category> = {}) {
    return super.read('Category', searchClause)
  }

  getSubCategories (searchClause: Partial<SubCategory> = {}) {
    return super.read('Category', searchClause)
  }
}

export default new ProductService()
