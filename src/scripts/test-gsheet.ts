const path = require('path')

const { google } = require('googleapis')
let sheets = google.sheets('v4')

const fs = require('fs')
const readline = require('readline')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
const credentials = require(path.join(__dirname, '../../configs/credentials.json'))
const { client_secret, client_id, redirect_uris } = credentials.installed
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0])

// Check if we have previously stored a token.
fs.readFile(TOKEN_PATH, (err, token) => {
  // TODO: Handle token expiration
  if (err) {
    return getNewToken(oAuth2Client, authorize)
  }
  oAuth2Client.setCredentials(JSON.parse(token))
  authorize(oAuth2Client)
})

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

function authorize (authClient) {
  // TODO: Change placeholder below to generate authentication credentials. See
  // https://developers.google.com/sheets/quickstart/nodejs#step_3_set_up_the_sample
  //
  // Authorize using one of the following scopes:
  //   'https://www.googleapis.com/auth/drive'
  //   'https://www.googleapis.com/auth/drive.file'
  //   'https://www.googleapis.com/auth/spreadsheets'

  if (authClient == null) {
    console.log('authentication failed')
    return
  }

  let request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: '1o4zVGBpvjRW9FE2adhYw5HKRefGaYf_igzPZxpyZyGw',  // TODO: Update placeholder value.

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: 'Sheet1!A1:Z1000',  // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.

    // How the input data should be inserted.
    insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.

    resource: {
      // TODO: Add desired properties to the request body.
      'values': [
        [
          'Denny',
          'Harijanto',
          28,
          'University of Washington'
        ]
      ]
    },

    auth: authClient
  }

  sheets.spreadsheets.values.append(request, function (err, response) {
    if (err) {
      console.error(err)
      return
    }

    // TODO: Change code below to process the `response` object:
    console.log(JSON.stringify(response, null, 2))
  })
}
