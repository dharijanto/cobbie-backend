import CRUDService from './crud-service'
import * as Promise from 'bluebird'
import GSheetHelper from '../libs/gsheet-helper'
import DemographicsService from './demographics-service'

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

  getLatestSurvey (userId: number) {
    return super.rawReadOneQuery(
      `SELECT * FROM surveys WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 1`
    )
  }

  processSurvey (userId: number): Promise<NCResponse<any>> {
    // 1. Take the latest filled out survey by userId
    // 2. Then upload it to google sheet
    // 3. Update Survey entry with the result

    return Promise.join(
      this.getLatestSurvey(userId),
      DemographicsService.getLatestDemographics(userId)
    ).spread((resp, resp2) => {
      if (resp.status && resp.data && resp2.status && resp2.data) {
        const demographics = resp2.data as Demographics
        const survey = resp.data as Survey
        if (survey.result) {
          return { status: false, errMessage: `Survey ${survey.id} has already been processed!` }
        } else {
          // TODO
          // 1. Format the data in accordance to Sheet layout
          const demographicsValues = JSON.parse(demographics.value)
          const surveyValues: any[][] = JSON.parse(survey.value)
          const pairs: any[] = [
            `userId: ${userId}, surveyId: ${survey.id}`,
            String(demographicsValues.age[0]),
            String(demographicsValues.gender[0]),
            '', // demographicsValues.ethnicity[0],
            String(demographicsValues.highestEducation[0]),
            String(demographicsValues.maritalStatus[0]),
            String(demographicsValues.yearsWithCompany[0])
          ]
          surveyValues.forEach(([topic, questionNumber, answer]) => {
            // Answer with questionNumber 1 starts on the 8th column of the row
            // hence we offset by 6
            pairs[parseInt(questionNumber, 10) + 6] = String(answer)
          })
          return { status: true, data: pairs }
        }
      } else {
        return { status: false, errMessage: 'Survey and demographics are required for processing!' }
      }
    })
  }
}

export default new SurveyService()
