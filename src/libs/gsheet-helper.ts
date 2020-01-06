import * as path from 'path'

import * as log from 'npmlog'
import * as Promise from 'bluebird'
import * as readline from 'readline'
// import { google } from 'googleapis'
const { google } = require('googleapis')
const sheets = google.sheets('v4')

import * as AppConfig from '../app-config'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TAG = 'GSheetHelper'

// Turn data!A10:B10 into
// {
//    sheet: data,
//    startRange: 'A10',
//    endRange: 'B10
// }
function parseA1Notation (notation: string): NCResponse<{ sheet: string, startRange: string, endRange: string }> {
  const result = notation.match('(.+)!(.+):(.+)')
  if (result && result.length > 3) {
    return { status: true, data: { sheet: result[1], startRange: result[2], endRange: result[3] } }
  } else {
    return { status: false }
  }
}

export interface SheetRange {
  sheet: string,
  startRange: string,
  endRange: string
}

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
  static insertRows (range: string, rows: any[][]): Promise<NCResponse<{ values: any[][], updatedRange: SheetRange }>> {
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
      insertDataOption: 'OVERWRITE',  // TODO: Update placeholder value.
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
        if (response.status === 200) {
          const parseResp = parseA1Notation(response.data.updates.updatedRange)
          let updatedRange = ''
          if (parseResp.status) {
            resolve({
              status: true,
              data: {
                values: response.data.values,
                updatedRange: parseResp.data!
              }
            })
          } else {
            resolve({
              status: false,
              errMessage: 'Failed to parse updated range!'
            })
          }
        } else {
          resolve({ status: false, errMessage: response.statusText })
        }
      })
    })
  }

  static getRow (range): Promise<NCResponse<{ values: any[][] }>> {
    const credentials = require(path.join(__dirname, '../../configs/google-api-credentials.json'))
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    oAuth2Client.setCredentials(JSON.parse(AppConfig.GSHEET_API.OAUTH_TOKEN))

    let request = {
      // The ID of the spreadsheet to retrieve data from.
      spreadsheetId: AppConfig.GSHEET_API.SPREADSHEET_ID,  // TODO: Update placeholder value.

      // The A1 notation of the values to retrieve.
      range,  // TODO: Update placeholder value.

      // How values should be represented in the output.
      // The default render option is ValueRenderOption.FORMATTED_VALUE.
      valueRenderOption: 'FORMATTED_VALUE',  // TODO: Update placeholder value.

      // How dates, times, and durations should be represented in the output.
      // This is ignored if value_render_option is
      // FORMATTED_VALUE.
      // The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
      dateTimeRenderOption: 'FORMATTED_STRING',  // TODO: Update placeholder value.
      majorDimension: 'ROWS',

      auth: oAuth2Client
    }

    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.get(request, function (err, response) {
        if (err) {
          reject(err)
        }
        if (response.status === 200) {
          resolve({
            status: true,
            data: {
              values: response.data.values
            }
          })
        } else {
          resolve({ status: false, errMessage: response.statusText })
        }
        // TODO: Change code below to process the `response` object:
      })
    })
  }

  static getRowNumber (range: SheetRange) {
    const [, rowNumber] = range.startRange.match('[A-Z]+([0-9]+)') || []
    const [, rowNumber2] = range.endRange.match('[A-Z]+([0-9]+)') || []

    // Only if startRange and endRange are within the same row
    if (rowNumber && rowNumber2 && rowNumber === rowNumber2) {
      return parseInt(rowNumber, 10)
    } else {
      return null
    }
  }

  // Given a sheet
  static getNeighboringRow (range: SheetRange, rowOffset) {
    const { sheet, startRange, endRange } = range
    const [, startCell, startRow] = startRange.match('([A-Z]+)([0-9]+)') || []
    const [, endCell, endRow] = endRange.match('([A-Z]+)([0-9]+)') || []

    return {
      sheet,
      startRange: `${startCell}${parseInt(startRow, 10) + rowOffset}`,
      endRange: `${endCell}${parseInt(endRow, 10) + rowOffset}`
    }
  }
}
