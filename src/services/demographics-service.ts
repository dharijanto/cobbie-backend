import CRUDService from './crud-service'
import * as Promise from 'bluebird'

class DemographicsService extends CRUDService {
  setDemographics (userId, key, value) {
    return super.create<Demographics>('Demographics', { userId, key, value })
  }
}

export default new DemographicsService()
