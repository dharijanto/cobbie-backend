import CRUDService from './crud-service'
import * as Promise from 'bluebird'

class DemographicsService extends CRUDService {
  /* setDemographics (userId, key, value) {
    return super.create<Demographics>('Demographics', { userId, key, value })
  } */

  createDemographics (userId: number) {
    return super.create<Demographics>('Demographics', { userId })
  }

  getLatestDemographics (userId: number) {
    return super.rawReadOneQuery(
      `SELECT * FROM demographics WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 1`
    )
  }

  setDemographics (userId: number, key, value) {
    return this.getLatestDemographics(userId).then(resp => {
      if (resp.status && resp.data) {
        const demographics = JSON.parse(resp.data.value || '{}')
        if (key in demographics) {
          throw new Error(`Key ${key} is already defined inside the demographics`)
        } else {
          demographics[key] = value
          return super.update<Demographics>('Demographics',
            { value: JSON.stringify(demographics) },
            { userId }
          )
        }
      } else {
        return { status: false, errMessage: `There's no demographics available!` }
      }
    })
  }
}

export default new DemographicsService()
