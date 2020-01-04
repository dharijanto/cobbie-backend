import * as AppConfig from '../app-config'
import * as Sequelize from 'sequelize'

import SequelizeService from '../services/sequelize-service'
import SurveyService from '../services/survey-service'
import GSheetHelper from '../libs/gsheet-helper'

const sequelizeSync = require('../db-structure')
const sequelize = new Sequelize(AppConfig.DB.DB_NAME, AppConfig.DB.USERNAME, AppConfig.DB.PASSWORD,
  {
    dialect: 'mysql',
    port: AppConfig.DB.PORT,
    logging: true
  })

const models = sequelizeSync(sequelize, {})
sequelize.sync().then(() => {
  SequelizeService.initialize(sequelize, models)
  SurveyService.processSurvey(1).then(resp => {
    console.dir(resp)
    if (resp.status && resp.data) {
      const row = resp.data
      GSheetHelper.insertRows('data!A2:AH1000', [row]).then(console.dir).catch(console.error)
    } else {
      console.error('Failed: ' + resp.errMessage)
    }
  }).catch(console.error)
})
