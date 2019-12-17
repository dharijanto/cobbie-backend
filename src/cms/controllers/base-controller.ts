import { CMSController } from '../../site-definitions'

const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const log = require('npmlog')

const TAG = 'NTech.BaseController'
abstract class BaseController extends CMSController {
  constructor (initData, useSubRouter = true) {
    super(Object.assign(initData, { viewPath: path.join(__dirname, '../views/v1') }), useSubRouter)
    log.verbose(TAG, 'assetsPath=' + this.assetsPath)
    log.verbose(TAG, 'viewPath=' + this.viewPath)
  }
}

export default BaseController
