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
    console.dir(resp, { depth: 10 })
    /* if (resp.status && resp.data) {
      const row = resp.data
      GSheetHelper.insertRows('data!A2:AH1000', [row]).then(resp => {
        if (resp.status && resp.data) {
          const updatedRange = resp.data.updatedRange
          console.log('Inserted new data to ' + JSON.stringify(updatedRange))
          const nextRow = GSheetHelper.getNeighboringRow(updatedRange, -1)
          // Wait 2 seconds for gsheet to do its job
          setTimeout(() => {
            GSheetHelper.getRow(`employee!${nextRow.startRange}:${nextRow.endRange}`).then(resp2 => {
              console.log('Retrieved data from ' + JSON.stringify(nextRow) + ' which is' + JSON.stringify(resp2))
            })
          }, 1)
        } else {
          console.error('Failed to insert rows: ' + resp.errMessage)
        }
      })
    } else {
      console.error('Failed: ' + resp.errMessage)
    } */
  }).catch(console.error)
})
