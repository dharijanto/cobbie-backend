import GSheetHelper from '../libs/gsheet-helper'

// GSheetHelper.getRow('data!A20:A20').then(result => {
GSheetHelper.getRow('employee!B17:J17').then(result => {
  console.dir(result)
}).catch(err => {
  console.dir(err)
})
