import BaseController from './controllers/base-controller'
import ProductService from '../services/product-service'
import SequelizeService from '../services/sequelize-service'
import { SiteData } from '../site-definitions'

const path = require('path')

let log = require('npmlog')

let CredentialController = require(path.join(__dirname, 'controllers/credential-controller'))

const TAG = 'MainController'

class Controller extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, 'views') }))
    SequelizeService.initialize(siteData.db.sequelize, siteData.db.models)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      log.verbose(TAG, 'loggedIn=' + req.isAuthenticated())
      log.verbose(TAG, 'req.on=' + JSON.stringify(req.session))
      next()
    })

    this.routeGet('/', (req, res, next) => {
      ProductService.getCategories().then(resp => {
        log.verbose(TAG, 'resp=' + JSON.stringify(resp))
        res.locals.data = resp.data
        res.render('index')
      })
    })

    /* this.routeUse((new CredentialController(initData)).getRouter()) */
  }
}

module.exports = Controller
