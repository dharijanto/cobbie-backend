const path = require('path')

const GSHEET_API = {
  OAUTH_TOKEN: '{"access_token":"ya29.Il-4B_nVtNGEKWzcFz3owm-hNGOtEcef1K8c6sLNQi1H3ND0_mtq3bD8oVVmtw1cj1KLTt_KURe40yfBqNg4AU-q2fgA15kwOkrTVC62qXP34h-qdvLifqtHIlKRG_UI8w","refresh_token":"1//0g1JRblJaOMTwCgYIARAAGBASNwF-L9IrimOjqP6l8VSBHN1hC76m3Av2pt5nHjJM5HxGj6U0jdTppqLCjpE6J4jyZUVKc_aepsQ","scope":"https://www.googleapis.com/auth/spreadsheets","token_type":"Bearer","expiry_date":1578042778848}',
  SPREADSHEET_ID: '1hh27PZg5g56qVSW7b2xixzY7hkIpJ6Od'
}

const DB = {
  USERNAME: 'root',
  PASSWORD: '',
  HOST: 'localhost',
  PORT: 3306,
  DB_NAME: 'app_ntech',
  TEST_DB_NAME: 'test_ntech'
}

// This information should match CUPS, see http://localhost:631/admin
const RECEIPT_PRINTER = {
  DEVICE_NAME: 'POS58',
  PAPER_WIDTH: '58mm'
}

// Per-customer customizable
const UI = {
  THEME_NAME: 'theme-1'
}

module.exports = {
  SQL_DB: `mysql://${DB.USERNAME}:${DB.PASSWORD}@${DB.HOST}:3306/${DB.DB_NAME}`,
  TEST_SQL_DB: `mysql://${DB.USERNAME}:${DB.PASSWORD}@${DB.HOST}:3306/${DB.TEST_DB_NAME}`,
  PRODUCTION: true,
  IMAGE_PATH: path.join(__dirname, '../images/'),
  IMAGE_MOUNT_PATH: '/images/',
  THUMBNAIL_IMAGE_MOUNT_PATH: '/thumbnail-images/',
  GSHEET_API
}
