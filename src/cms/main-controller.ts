import BaseController from './controllers/base-controller'

const path = require('path')

const log = require('npmlog')

const TAG = 'MainController'
class MainController extends BaseController {
  constructor (initData) {
    initData.logTag = 'CMSMainController'
    super(initData)

    this.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)

      res.locals.siteHash = this.siteHash
      res.locals.__sidebar = [
        { title: 'Menu 1', url: `/${this.siteHash}/menu-1`, faicon: '' }
      ]
      next()
    })

    this.routeGet('/', (req, res, next) => {
      res.render('product-management')
    })
  }

  getSidebar () {
    return []
  }
}

module.exports = MainController
