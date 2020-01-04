import GSheetHelper from '../libs/gsheet-helper'

GSheetHelper.insertRows('data!A2:AR1000', [[1, 2, 3, 4, 5]]).then(result => {
  console.dir(result)
}).catch(err => {
  console.dir(err)
})
