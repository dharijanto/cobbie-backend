import DemographicsService from '../services/demographics-service'
import * as States from '../data/states-trimmed'

function executeAction (action) {
  const state = States.state

  // tslint:disable-next-line:no-eval
  return eval(action)
}

function fillSurvey (surveySessionid, surveyTopicId, value) {

}

export {
  executeAction,
  fillSurvey
}
