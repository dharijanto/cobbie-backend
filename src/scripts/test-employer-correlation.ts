import GSheetHelper from '../libs/gsheet-helper'
import employerService from '../services/employer-service'

employerService.getSurveyCorrelation().then(result => {
  console.log(JSON.stringify(result, null, 2))
}).catch(err => {
  console.dir(err)
})
