# Finite State Machine (FSM)-based Chatbot Backend

## Live Demo
- A react native frontend application uses this: https://expo.io/@adennyh/cobbie-frontend

![Screenshot 1](https://nusantara-cloud.com/img/cobbie/1.jpg)
![Screenshot 2](https://nusantara-cloud.com/img/cobbie/2.jpg)
![Screenshot 3](https://nusantara-cloud.com/img/cobbie/3.jpg)

## Background

We were exploring a startup idea to assist HR on
figuring out the well-being of their employees. The idea is to create
a chatbot-buddy that personally interacts with each of the employees,
asking some sort of surveys to continually monitor their mental well-being.

This code base powers the backend of the chatbot. It uses finite-state-machine described in
a typescript definition (src/data/sets.ts) that can easily be modified to program the bot, such
as to modify the text prompt or the multiple-choice input.

## API
### [GET] /api/v1/chatbot/current-state
* Response:
```
{
  messages: [
    'Hi there, nice to meet you!',
    'My name is Cobbie, your personal assistant :)'
  ],
  responses: [
    { type: 'button', text: 'Nice to meet you too, Cobbie!'}
  ]
}
```

### [POST] /api/v1/chatbot/current-state
* Body
```
{
  index: 0,
  data: {
    text: 'This is filled only if the response is of type free-text'
  }
}
```

## Survey Processing

Because this was just a proof-of-concept, to reduce the development effort
we leverage on Google Sheet to process the employee survey. A partner of mine
focused on writing google sheet formula to process rows that are inserted by
this backend via Sheet's API. After Sheet has finished processing the result,
this backend retrieves it using another API call.


### Google Sheet API Setup
1. Go to Google APIs console
https://console.developers.google.com/
2. Create service account keys, with role as editor
3. Download JSON key
4. Copy email client, and share the spreadsheet with that email client
5. Now we can use Google console's web interface to do testing
6. Follow this to enable auth from NodeJS (through OAuth)
  https://developers.google.com/sheets/api/quickstart/nodejs#step_3_set_up_the_sample

### Google Sheet API Docs
* Insert to table
https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
  * Spreadsheet ID: Look at the sheet's URL, just after /id/
  * Range: A1 Notation (i.e. "Sheet1!A1:Z1000") -> this is used to figure out where the table is
  * insertDataOption: 'INSERT_ROWS'
  * Value Input Option: "USER ENTERED"
  * Request body:
    ```
    {
      "values": [
        [
          "Denny",
          "Harijanto",
          28,
          "University of Washington"
        ]
      ]
    }
    ```
  * Response body:
    ```
    {
      "spreadsheetId": "1o4zVGBpvjRW9FE2adhYw5HKRefGaYf_igzPZxpyZyGw",
      "tableRange": "Sheet1!A1:D1",
      "updates": {
        "spreadsheetId": "1o4zVGBpvjRW9FE2adhYw5HKRefGaYf_igzPZxpyZyGw",
        "updatedRange": "Sheet1!A2:D2",
        "updatedRows": 1,
        "updatedColumns": 4,
        "updatedCells": 4
      }
    }
    ```
