import CRUDService from './crud-service'
import * as Promise from 'bluebird'
import GSheetHelper, { SheetRange } from '../libs/gsheet-helper'
import DemographicsService from './demographics-service'
import Formatter from '../libs/formatter'
import userService from './user-service'

class EmployerService extends CRUDService {

  private parseCorrelationRowsToD3Data (rows) {
    const rowTitles = ['Workload', 'Control', 'Rewards', 'Community', 'Justice', 'Standards']
    const colTitles = ['Exhaustion', 'Depersonalization', 'Personal Accomplishment']
    const result = [] as any[]
    if (rows.length > 0) {
      if (rows[0].length > 0) {
        for (let i = 0; i < rowTitles.length; i++) {
          console.log(`i=${i}`)
          const rowTitle = rowTitles[i]
          const current = {
            category: rowTitle,
            values: [] as any[]
          }
          for (let j = 0; j < colTitles.length; j++) {
            console.log(`j=${j}`)
            const colTitle = colTitles[j]
            current.values.push({
              value: rows[i][j],
              rate: colTitle
            })
          }
          result.push(current)
        }
        return result
      } else {
        throw new Error('Unexpected data!')
      }
    } else {
      throw new Error('Unexpected data!')
    }
  }

  /*
  Sample result format:
  [{
		type: "rangeColumn",
		name: "Workload",
		showInLegend: true,
		yValueFormatString: "#0.## °C",
		xValueFormatString: "MMM, YYYY",
		dataPoints: [
      { x: 'Exhaustion', y: '-0.5970553545' },
      { x: 'Depersonalization', y: '-0.3015216177' },
      { x: 'Personal Accomplishment', y: '0.1346723454' }]
  }]
   */
  private parseCorrelationRowsToCanvasJS (rows) {
    const rowTitles = ['Workload', 'Control', 'Rewards', 'Community', 'Justice', 'Standards']
    const colTitles = ['Exhaustion', 'Depersonalization', 'Personal Accomplishment']
    const results = [] as any[]
    for (let i = 0; i < colTitles.length; i++) {
      const current = {
        type: 'rangeColumn',
        name: colTitles[i],
        showInLegend: true,
        yValueFormatString: '0',
        xValueFormatString: '0',
        dataPoints: [] as any[]
      }
      for (let j = 0; j < rowTitles.length; j++) {
        current.dataPoints.push(
          {
            x: j,
            label: rowTitles[j],
            y: [0, parseFloat(rows[j][i])]
          })
      }
      results.push(current)
    }
    return results
  }

  getSurveyCorrelation () {
    return GSheetHelper.getRow('employer overview!B2:D7').then(resp => {
      if (resp.status && resp.data) {
        const rows: any[][] = resp.data.values
        // const result = this.parseCorrelationRowsToD3Data(rows)
        const result = this.parseCorrelationRowsToCanvasJS(rows)
        return { status: true, data: result }
        // Massage the data to be used by graphing library
        return resp
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }
}

export default new EmployerService()
