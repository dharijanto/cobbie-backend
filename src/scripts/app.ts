import * as Promise from 'bluebird'
import * as readline from 'readline'

import * as readlinesync from 'readline-sync'

import FSMStates, * as AllFSMStates from '../data/states-trimmed'
import { executeAction } from '../libs/fsm-functions'

const state = AllFSMStates.state

function parseStates (states: Array<State>): { [key: string]: State } {
  const hash = {}
  // Put each state on hashmap for easy access
  states.forEach(state => {
    hash[state.id] = state
  })

  return hash
}

const stateMap = parseStates(FSMStates)

// This is prototype code for parsing the state machine

// Return 'true' if logic condition is met
function checkStateLogicCondition (logic) {
  console.log(`checkStateLogicCondition(): logic=${JSON.stringify(logic)}`)
  // Condition is not defined
  if (!logic.condition) {
    return true
    // Condition is defined and is passed
  } else {
    // tslint:disable-next-line:no-eval
    const conditionPassed = executeAction(logic.condition)
    if (conditionPassed) {
      return true
    } else {
      return false
    }
  }
}

// Print out each of the messages one by one, but delay first according to the message
// length
function parseMessages (messages: string[]) {
  console.log(`parseMessages(): messages${JSON.stringify(messages)}`)
  /* return messages.reduce((acc, message) => {
    return acc.then(() => {
      return Promise.delay(message.length * 10).then(() => {
        return console.log(message)
      })
    })
  }, Promise.resolve()) */
  messages.forEach(message => {
    console.log(message)
  })
}

// Display all responses to the user, take up
// an answer, then return the state to redirect to
function parseResponses (responses: any[]): State | null {
  console.log('parseResponses(): responses=' + JSON.stringify(responses))
  let responseMap = {}
  // Print out each of the responses prompt
  responses.forEach((response, index) => {
    responseMap['' + index] = response
    if (response.type === 'button') {
      console.log(`[${index}] ${response.text}`)
    } else {
      throw new Error('Unexpected response type: ' + response.type)
    }
  })

  while (true) {
    const answer = readlinesync.question(`Which one is your reponse? ${JSON.stringify(Object.keys(responseMap))}: `)
    const response = responseMap[parseInt(answer, 10)]
    let input
    if (!response) {
      console.log(`Invalid response: ' + response + ' pick one of ${JSON.stringify(Object.keys(responseMap))}`)
    } else {
      if (response.type === 'button') {
        // Nope
      } else if (response.type === 'text') {
        input = readlinesync.question(`Enter your answer: `)
      } else {
        throw new Error('Invalid FSM programming: ' + JSON.stringify(response))
      }

      // There's an action defined, execute it
      if (response.action) {
        // tslint:disable-next-line:no-eval
        const executedAction = executeAction(response.action)
      }
      // If there's a state associated with selected response, return it.
      const nextState = stateMap[response.nextState]
      if (nextState) {
        return nextState
      } else {
        return null
      }
    }
  }
}

function parseState (state) {
  console.log(`parseState(): state=${JSON.stringify(state)}`)
  // Evaluate each of the logics
  state.logics.forEach((logic, index) => {
    console.log(`parseState(): logic=${JSON.stringify(logic)}`)
    // Check on the condition
    const conditionFulfilled = checkStateLogicCondition(logic)
    if (conditionFulfilled) {
      if (logic.messages && logic.messages.length > 0) {
        // Parse messages here.
        parseMessages(logic.messages)
      }
      if (logic.responses && logic.responses.length > 0) {
        parseResponses(logic.responses)
      }

      const nextState = stateMap[logic.nextState]
      console.log(`parseState(): nextState=${JSON.stringify(nextState)}`)
      if (nextState) {
        parseState(nextState)
      }
    }
  })
}

// Start with main
let nextState: State = stateMap['MAIN']

while (true) {
  if (nextState) {
    parseState(nextState)
  } else {
    nextState = stateMap['MAIN']
  }
  throw new Error('pause!')

}
