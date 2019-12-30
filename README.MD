# FSM
## Requirements
From current business requirement, we'd need to be able to separate the states into different levels.

L1: MAIN, DEMOGRAPHICS, SURVEY, PERSONAL LIBRARY
L2: SURVEY:
      AOW, BO, 2Q
    PERSONAL LIBRARY:
      NEW CONTENT, RECOMMENDER

## Concepts
### FSM
-L1: This is the top-most states. Each can have its own child states.

-MAIN is the entry point of the app. It's like the default state the user will be in when they
first use the app. It will have the navigation logic of which state to transition initially.

-To make things managable, we'll have L1 states to only be able to navigate either to:
 its child states or go back to MAIN. This helps reducing the potential of creating dependency hell because
 then each state would be self-dependent while the glue between states is just MAIN. So when we need to remove/add
 new states, we can easily glue them with them program through the MAIN state.

-This whole thing can be represented/visualized by drawing a directed graph. Then after
 the business side / Alan does the coding, we can visualize how the entire thing will tie together
 even before running the application

### User State & Functions
Each of the information regarding a user is persisted in a database. How it's stored is outside of the scope
of this document (i.e. MySQL, Firebase, etc). We'll only talk about how it's represented and used.

To make complex program, when state needs to transition to other states, it needs more information
to figure out which state to move into. For example, we're at MAIN and want to move to DEMOGRAPHIC
when user hasn't filled up their demographics information yet. Here, it would mean that when demographics field
on user state is null, we'll do that. But since at some point we'll have more data than
we can pre-load into the state, we might resort
into creating functions that FSM programmer can use, which would do asynchronous operation on call.

### FSM Notes:
clearStack: true: // By default, when there's no more logics in a state, it will go back to whatever previous state that leads to it. So if you want to clear out remembered states, set this to true

### Parsing
For UI presentation, we can do several things to make visual improvements:
1. Create an effect as if the bot is typing. The length of typing is correlated to the length of the sentence
2.

# API Design
## Endpoints
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

# Statistics
To ease out backend development effort, we'll try to leverage Google Sheet.
The idea is that we'll pre-defined the formula on google sheet then have the backend to just
pass the data as rows. After that, the backend will get the data computed by the Sheet's formula.

## Steps
1. Go to Google APIs console
https://console.developers.google.com/
2. Create service account keys, with role as editor
3. Download JSON key
4. Copy email client, and share the spreadsheet with that email client
5. Now we can use Google console's web interface to do testing
6. Follow this to enable auth from NodeJS (through OAuth)
  https://developers.google.com/sheets/api/quickstart/nodejs#step_3_set_up_the_sample

## APIs
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