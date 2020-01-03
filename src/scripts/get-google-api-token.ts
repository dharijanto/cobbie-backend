import GSheetHelper from '../libs/gsheet-helper'

GSheetHelper.getNewToken().then(token => {
  console.dir(token)
}).catch(err => {
  console.error(err)
})
