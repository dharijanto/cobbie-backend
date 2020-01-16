import CRUDService from './crud-service'
import * as Promise from 'bluebird'
import GSheetHelper, { SheetRange } from '../libs/gsheet-helper'
import DemographicsService from './demographics-service'
import Formatter from '../libs/formatter'
import userService from './user-service'

const blurbs = {
  'Workload': {
    'Green': 'You do not stand out from your peers, and you probably manage your work, time, and people well.',
    'Yellow': 'According to the survey, you might be having some difficulting managing the volume of work or the time needed to complete it. The issues are probably not intense, but they are evident. For your well-being, it might be beneficial to check out:',
    'Red': 'According to the survey, managing the work and time to complete the work are issues that negatively impact your well-being. This is a major source of stress for you. Learn more about how to improve how you manage your workload:'
  },
  'Control': {
    'Green': 'When compared to your peers, you show the a normal amount of personal autonomy and control over your work. You probably feel like you are in control of your work and your future. Read more about this area here:',
    'Yellow': 'You might have concerns about how much influence you have on your own work and career. You may feel in comfortable one day then feel like there is little personal autonomy the next. Learn more about how to improve here:',
    'Red': 'You probably feel like you have little influence over your work and career at the organization and this negatively impacts your well-being. Learn more about how to improve control over your work:'
  },
  'Rewards': {
    'Green': 'You don’t stand out from your peers, and you feel that your work represents your rewards.',
    'Yellow': 'You might occasionally feel that your work does not represent the rewards, monetarily or personal recognition. Learn more about improving a sense of rewards here:',
    'Red': 'Chances are you feel that the work you are doing is not properly compensated. You probably feel that you aren\'t paid enough, don’t get enough recognition, or both, and this is negatively impacting your well-being. Learn more about how improve here:'
  },
  'Community': {
    'Green': 'You share the same sense of community as your peers.',
    'Yellow': 'You might feel disconnected from your peers at work, and it could be impacting your well-being. You might feel that working with others is uncomfortable and you might find it difficult to communicate. Learn more here:',
    'Red': 'You probably feel like people at work make you feel uncomfortable or feel like strangers. This can cause discomfort in communicating with them. Learn more about how to improve your personal community at work:'
  },
  'Justice': {
    'Green': 'You hold similar views to others at work about equality, favoritism, and justice at work.',
    'Yellow': 'You might feel like there is favoritism, unfairness, or unprofessionalism at work, and this negatively impacts your well-being. Learn more about how to improve your sense of justice at work:',
    'Red': 'Chances are you believe work is unjust and unfair. This is a source that impacts your well-being negatively. Learn more about how address:'
  },
  'Standards': {
    'Green': 'You and your peers hold similar values when aligning with company standards.',
    'Yellow': 'You might disagree or do not feel the aligned with the company values. This lack of congruency could be having an impact on your well-being. Learn more here about how to improve:',
    'Red': 'You probably do not align with the company\'s values, and it probably negatively effects your well-being since your own values and standards do not align with the company. Learn more here:'
  },
  'Exhaustion': {
    'Green': 'You have a similar mental and physical output as your peers.',
    'Yellow': 'You are probably exhausted mentally or physically, and it is potentially a source impacting your well-being. Learn more here about how to improve:',
    'Red': 'You exhaustion levels are probably a major source that impacts your well-being. You probably feel exhausted, tired, and, potentially, even sore often. Read more about how to improve:'
  },
  'Depersonalization': {
    'Green': 'You have a similar outlook on your peers as others.',
    'Yellow': 'You might occasionally view people as methods to accomplish goals, or you feel that others view you in the same way. This is probably a source that impacts your well-being negatively. Learn more here about how to improve:',
    'Red': 'You probably have "lost yourself" and a sense of feelings for others may be lost. You might also believe that others view you as a method to get things done instead of viewing you as a person. Learn more here how to address this:'
  },
  'Personal Accomplishment': {
    'Green': 'Your feelings of accomplishments and impact are similar to your peers.',
    'Yellow': 'You might find it difficult to gain a sense of accomplishment and pride either because of your own efforts, the organization\'s goals in relation to your own, or those you work with. Learn more how ot improve your own sense of personal growth:',
    'Red': 'You find it difficult to accomplish your own goals with major factors including your peers, organizational goals, and lack of meaning in your work. Learn more about how to address this:'
  }
}

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

  hasFilledSurvey (userId: number): Promise<NCResponse<null>> {
    return super.rawReadOneQuery(
      `SELECT * FROM surveys WHERE userId=${userId} AND result IS NOT NULL ORDER BY createdAt DESC LIMIT 1`
    ).then(resp => {
      if (resp.status) {
        return { status: true }
      } else {
        return { status: false }
      }
    })
  }

  getLatestSurvey (userId: number) {
    return super.rawReadOneQuery(
      `SELECT * FROM surveys WHERE userId = ${userId} and result IS NOT NULL ORDER BY createdAt DESC LIMIT 1`
    )
  }

  getLatestUnprocessedSurvey (userId: number) {
    return super.rawReadOneQuery(
      `SELECT * FROM surveys WHERE userId = ${userId} and result IS NULL ORDER BY createdAt DESC LIMIT 1`
    )
  }

  private insertSurveyToSheetAndGetEmployeeResult (row: any[])
      : Promise<NCResponse<{values: any[][], insertRange: SheetRange, resultRange: SheetRange}>> {
    return GSheetHelper.insertRows('data!A2:AH1000', [row]).then(resp => {
      if (resp.status && resp.data) {
        const insertRange: SheetRange = resp.data.updatedRange
        const insertRow = GSheetHelper.getRowNumber(insertRange)
        if (insertRow !== null) {
          // There's a difference of 1 row between 'data' table and 'employee' table
          const employeeRow = insertRow - 1
          // Wait 3 sec to make sure google sheet has processed the data
          return Promise.delay(3000).then(() => {
            const resultRange: SheetRange = {
              sheet: 'employee',
              startRange: `A${employeeRow}` ,
              endRange: `S${employeeRow}`
            }
            return GSheetHelper.getRow(`${resultRange.sheet}!${resultRange.startRange}:${resultRange.endRange}`).then(resp => {
              if (resp.status && resp.data) {
                const data = {
                  values: resp.data.values,
                  insertRange,
                  resultRange
                }
                return { status: true, data }
              } else {
                return { status: false, errMessage: 'Failed to retrieve employee result: ' + resp.errMessage }
              }
            })
          })
        } else {
          return { status: false, errMessage: 'Failed to retrieve row number!' }
        }
      } else {
        return { status: false, errMessage: 'Failed to insert survey: ' + resp.errMessage }
      }
    })
  }

  getSurveyResult (userId: number): Promise<NCResponse<Array<{title: string, score: number, color: string}>>> {
    if (userId) {
      return this.getLatestSurvey(userId).then(resp => {
        if (resp.status && resp.data) {
          // Throw away information regarding userId, using slice()
          const surveyResult: any[] = (JSON.parse(resp.data.result).values)[0].slice(1)
          const titles = ['Workload', 'Control', 'Rewards', 'Community', 'Justice',
            'Standards', 'Exhaustion', 'Depersonalization', 'Personal Accomplishment']
          const keys = ['score', 'color']
          const result: any = {
            workAreas: [],
            personalAreas: []
          }
          // Areas of worklife
          for (let i = 0; i < titles.length; i++) {
            let arr
            if (i < 6) {
              arr = result.workAreas
            } else {
              arr = result.personalAreas
            }
            const title = titles[i]
            const score = surveyResult[i]
            const sheetColor = surveyResult[i + titles.length]
            let color
            if (sheetColor.includes('Red')) {
              color = '#ff527f'
            } else if (sheetColor.includes('Green')) {
              color = '#51d69f'
            } else {
              // Yellow
              color = '#fdb83f'
            }
            arr.push({ title, score, sheetColor, color, blurb: blurbs[title][sheetColor] })
          }
          return { status: true, data: result }
        } else {
          return { status: false, errMessage: 'Survey needs to be taken first!' }
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'userId is required!' })
    }
  }

  processSurvey (userId: number): Promise<NCResponse<any>> {
    // 1. Take the latest filled out survey by userId
    // 2. Then upload it to google sheet
    // 3. Update Survey entry with the result

    return Promise.join(
      this.getLatestUnprocessedSurvey(userId),
      DemographicsService.getLatestDemographics(userId),
      userService.getUser(userId)
    ).spread((resp, resp2, resp3) => {
      if (resp3.status && resp.data) {
        const user = resp3.data
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
              `username: ${user.username} userId: ${userId}, surveyId: ${survey.id}`,
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

            // Time start
            pairs.push(Formatter.dateToString(survey.createdAt))
            // Time end, now
            pairs.push(Formatter.dateToString(new Date()))

            // Insert to GSheet
            return this.insertSurveyToSheetAndGetEmployeeResult(pairs).then(resp => {
              if (resp.status && resp.data) {
                return super.update<Survey>('Survey', { result: JSON.stringify(resp.data) }, { id: survey.id }).then(resp2 => {
                  if (resp2.status) {
                    return { status: true, data: resp.data }
                  } else {
                    return { status: false, errMessage: 'Failed to save survey result!' }
                  }
                })
              } else {
                return { status: false, errMessage: 'Failed to insert and get employee result: ' + resp.errMessage }
              }
            })
          }
        } else {
          return { status: false, errMessage: 'Survey and demographics are required for processing!' }
        }
      } else {
        return { status: false, errMessage: 'user could not be found!' }
      }
    })
  }
}

export default new SurveyService()
