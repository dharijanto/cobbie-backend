import * as AppConfig from '../app-config'
import * as Sequelize from 'sequelize'

import SequelizeService from '../services/sequelize-service'
import SurveyService from '../services/survey-service'
import GSheetHelper from '../libs/gsheet-helper'
import UserService from '../services/user-service'

const sequelizeSync = require('../db-structure')
const sequelize = new Sequelize(AppConfig.DB.DB_NAME, AppConfig.DB.USERNAME, AppConfig.DB.PASSWORD,
  {
    dialect: 'mysql',
    port: AppConfig.DB.PORT,
    logging: true
  })

const username = 'uniqueUser123'
const password = '1234'
const models = {}
sequelizeSync(sequelize, models)
sequelize.sync().then(() => {
  SequelizeService.initialize(sequelize, models)
  models['User'].destroy({ where: { username: 'uniqueUser123' } }).finally(() => {
    UserService.register(username, password, password, 'mypng').then(resp => {
      console.dir('Register: ' + JSON.stringify(resp))
      UserService.login(username, password).then(resp => {
        console.dir('Login: ' + JSON.stringify(resp))
      })
    })
  })
})
