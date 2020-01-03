import CRUDService from './crud-service'
import * as Promise from 'bluebird'

class SurveyService extends CRUDService {
  createSurvey (userId: number) {
    return super.create<Survey>('Survey', { userId })
  }

  setSurvey (userId: number, topicName, topicId, value) {
    return super.rawReadOneQuery(
      `SELECT * FROM surveys WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 1`
    ).then(resp => {
      if (resp.status && resp.data) {
        const survey = JSON.parse(resp.data.value || '[]')
        survey.push([topicName, topicId, value])
        return super.update<Survey>('Survey',
          { value: JSON.stringify(survey) },
          { userId }
        )
      } else {
        return { status: false, errMessage: `There's no demographics available!` }
      }
    })
  }

  processSurvey (userId: number) {
    // 1. Take the latest filled out survey by userId
    // 2. Then upload it to google sheet
    // 3. Update Survey entry with the result
    return super.rawReadOneQuery(
      `SELECT * FROM surveys WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 1`
    ).then(resp => {
      if (resp.status && resp.data) {
        const survey = resp.data as Survey
        if (survey.result) {
          return { status: false, errMessage: `Survey ${survey.id} has already been processed!` }
        } else {
          // TODO
          return {}
        }
      } else {
        return { status: false, errMessage: 'There is no survey to be processed!' }
      }
    })
  }
}

export default new SurveyService()
