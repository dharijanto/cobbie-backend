import {AppController} from '../../site-definitions'

const express = require('express')
const path = require('path')
const fs = require('fs')
const log = require('npmlog')

abstract class BaseController extends AppController {

}

export default BaseController
