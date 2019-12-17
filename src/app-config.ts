import * as path from 'path'

const DB = {
  USERNAME: 'root',
  PASSWORD: '',
  HOST: 'localhost',
  PORT: 3306,
  DB_NAME: 'app_ntech'
}

export default {
  PRODUCTION: false,
  IMAGE_PATH: path.join(__dirname, '../images/'),
  IMAGE_MOUNT_PATH: '/images/',
  CLOUD_SERVER: false,
  DB
}
