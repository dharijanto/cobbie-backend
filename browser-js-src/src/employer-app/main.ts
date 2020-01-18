// import * as CanvasJS from 'canvasjs'
const CanvasJS = require('canvasjs')
import axios from 'axios'

function toggleDataSeries (e) {
  if (typeof (e.dataSeries.visible) === 'undefined' || e.dataSeries.visible) {
    e.dataSeries.visible = false
  } else {
    e.dataSeries.visible = true
  }
  e.chart.render()
}

window.onload = function () {
  CanvasJS.addColorSet('MotivImpact',
    [// colorSet Array
      '#fbad17',
      '#954c9d',
      '#01bd70',
      '#de88b9',
      '#f26422',
      '#5b8dca'
    ])

  axios.get('/api/v1/employer/company-overview').then(rawResp => {
    const resp = rawResp.data
    if (resp.status && resp.data) {
      let companyData = resp.data
      let chart = new CanvasJS.Chart('chartContainer', {
        colorSet: 'MotivImpact',
        animationEnabled: true,
        exportEnabled: true,
        title: {
          text: 'Company Overview'
        },
        axisX: {
          valueFormatString: '0'
        },
        axisY: {
          includeZero: false,
          minimum: -1,
          maximum: 1
        },
        toolTip: {
          shared: true
        },
        legend: {
          cursor: 'pointer',
          itemclick: toggleDataSeries
        },
        data: companyData
      })
      chart.render()
    } else {
      alert('Failed to retrieve company data!')
    }
  })
}
