import BaseController from './controllers/base-controller'
import DemographicsService from '../services/demographics-service'
import SequelizeService from '../services/sequelize-service'
import { SiteData } from '../site-definitions'
import FSMService from '../services/fsm-service'
import UserService from '../services/user-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    log.level = 'verbose'
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })

    this.routeGet('/', (req, res, next) => {
      // res.render('index')
      res.send('hello')
    })

    this.routeGet('/api/v1/chatbot/current-state', (req, res, next) => {
      // const userId = (req.user || {}).id
      // HACK until we implement JWT
      const userId = req.query.userId
      // DemographicsService.getRunningStates(userId).then(resp => {
      // })
      FSMService.getCurrentFrontendAction(userId).then(resp => {
        log.verbose(TAG, '/api/v1/chatbot/current-state.GET: ' + JSON.stringify(resp))
        res.json(resp)
      }).catch(next)
    })

    this.routePost('/api/v1/chatbot/current-state', (req, res, next) => {
      // HACK until we implement JWT
      const userId = req.query.userId
      const response = req.body
      FSMService.submitFrontendResponse(userId, response).then(resp => {
        res.json(resp)
      }).catch(next)
    })

    this.routePost('/api/v1/auth/login', (req, res, next) => {
      const { username, password } = req.body
      // HACK until we implement JWT
      UserService.login(username, password).then(resp => {
        if (resp.status && resp.data) {
          res.json({ status: true, data: resp.data.id })
        } else {
          res.json({ status: false, errMessage: resp.errMessage })
        }
      }).catch(next)
    })

    this.routePost('/api/v1/auth/register', (req, res, next) => {
      const { username, password, passwordConfirm, companyCode } = req.body
      // HACK until we implement JWT
      UserService.register(username, password, passwordConfirm, companyCode).then(resp => {
        if (resp.status && resp.data) {
          res.json({ status: true, data: resp.data.id })
        } else {
          res.json({ status: false, errMessage: resp.errMessage })
        }
      }).catch(next)
    })

    /* this.routeUse((new CredentialController(initData)).getRouter()) */
  }
}

module.exports = Controller
