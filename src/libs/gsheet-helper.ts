import * as path from 'path'

import * as log from 'npmlog'
import * as readline from 'readline'
// import { google } from 'googleapis'
const { google } = require('googleapis')
const sheets = google.sheets('v4')

import * as AppConfig from '../app-config'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TAG = 'GSheetHelper'

export default class {
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  static getNewToken (): Promise<string> {
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })
      console.log(TAG,'Authorize this app by visiting this url:', authUrl)
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
          if (err) {
            reject(err)
          }
          if (token) {
            oAuth2Client.setCredentials(token)
            resolve(JSON.stringify(token))
          } else {
            reject(new Error('Token is unexpectedly empty!'))
          }
        })
      })
    })
  }

  /*
  range: 'Sheet1!A1:Z1000'
  rows: [
          [
            'Denny',
            'Harijanto',
            28,
            'University of Washington'
          ]
        ]
  */
  static insertRows (range: string, rows: any[][]): Promise<any> {
    const credentials = require(path.join(__dirname, '../../configs/google-api-credentials.json'))
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    oAuth2Client.setCredentials(JSON.parse(AppConfig.GSHEET_API.OAUTH_TOKEN))

    let request = {
      // The ID of the spreadsheet to update.
      spreadsheetId: AppConfig.GSHEET_API.SPREADSHEET_ID,  // TODO: Update placeholder value.
      // The A1 notation of a range to search for a logical table of data.
      // Values will be appended after the last row of the table.
      range,  // TODO: Update placeholder value.
      // How the input data should be interpreted.
      valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.
      // How the input data should be inserted.
      insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.
      resource: {
        // TODO: Add desired properties to the request body.
        'values': rows
      },
      auth: oAuth2Client
    }

    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.append(request, function (err, response) {
        if (err) {
          reject(err)
        }
        log.verbose(TAG, JSON.stringify(response, null, 2))
        resolve(response)
      })
    })
  }

  private static test () {
    return
  }
}
