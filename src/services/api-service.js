var path = require('path')

var axios = require('axios')
var log = require('npmlog')
var url = require('url')

var AppConfig = require(path.join(__dirname, '../app-config'))

const TAG = 'APIService'

/*
  All GET/POST requests should go through this class to have
  unified boilerplate handling.

  All REST API calls return either:
   {status: true, data: [Object]})
     or
   {status: false, errCode: [Integer, HTTP error code from backend], errMessage: [String, HTTP error status from backend]}

  In case of other error, a rejected promise is returned
*/
class APIService {
  // apiSubFolder: subfolder path for the API
  // i.e. /api/v1/client
  constructor ({baseURL, apiSubFolder}) {
    this._axios = axios.create({
      baseURL: url.resolve(baseURL, apiSubFolder),
      timeout: AppConfig.RPC_TIMEOUT
    })
  }

  getTag () {
    throw new Error('Not implemented!')
  }

  getAPIPath (apiFilename) {
    return url.resolve(this._axios.defaults.baseURL, apiFilename)
  }

  /*
    Return:
      {status: true, data: ... }
      or
      {status: false, errCode: 400, errMessage: 'BAD REQUEST', errData: 'Username is already used'}

    Promise rejection on other error.

    Convention:
      status: true is returned if the intended operation is successful. (e.g. registration is successful)
              in other words, true means UI should render 'success', false means UI should render 'error'
  */
  apiPOST (apiFilename, payload) {
    log.verbose(TAG, `apiPOST(): apiFilename=${apiFilename} payload=${JSON.stringify(payload)}`)
    return new Promise((resolve, reject) => {
      this._axios.post(apiFilename, payload).then(resp => {
        resolve({status: true, data: resp.data})
      }).catch(err => {
        if (err.response) {
          log.error(this.getTag(), `apiPOST(): apiPath=${this.getAPIPath(apiFilename)} ` +
            `payload=${JSON.stringify(payload)} err.response.status=${err.response.status} ` +
            `err.response.statusText=${(err.response.statusText)} err.response.data=${(JSON.stringify(err.response.data))})`)
          resolve({status: false, errCode: err.response.status, errMessage: err.response.statusText, errData: err.response.data})
        } else {
          reject(err)
        }
      })
    })
  }

  apiGET (apiFilename, params = null) {
    log.verbose(TAG, `apiGET(): apiFilename=${apiFilename} params=${JSON.stringify(params)}`)
    return new Promise((resolve, reject) => {
      this._axios.get(this.getAPIPath(apiFilename), {params}).then(resp => {
        // console.log(CircularJSON.stringify(resp))
        resolve({status: true, data: resp.data})
      }).catch(err => {
        if (err.response) {
          log.error(this.getTag(), `apiGET(): apiPath=${this.getAPIPath(apiFilename)} ` +
            `err.response.status=${err.response.status} ` +
            `err.response.statusText=${(err.response.statusText)} err.response.data=${(JSON.stringify(err.response.data))})`)
          resolve({status: false, errCode: err.response.status, errMessage: err.response.statusText, errData: err.response.data})
        } else {
          reject(err)
        }
      })
    })
  }
}

module.exports = APIService
