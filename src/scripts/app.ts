import * as Promise from 'bluebird'
import * as readline from 'readline'

import * as readlinesync from 'readline-sync'

import FSMStates, * as AllFSMStates from '../data/states-trimmed'
import { executeAction } from '../libs/fsm-functions'

const DEBUG = false

function debugMessage (message) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`)
  }
}

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
  // Condition is not defined
  if (!logic.condition) {
    return true
    // Condition is defined and is passed
  } else {
    // tslint:disable-next-line:no-eval
    debugMessage(`executeAction(): logic=${logic}`)
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
  debugMessage(`parseMessages(): messages${JSON.stringify(messages)}`)
  messages.forEach(message => {
    console.log(message)
  })
}

// Display all responses to the user, take up
// an answer, then return the state to redirect to
function parseResponses (responses: any[]): StateLogicResponse {
  debugMessage('parseResponses(): responses=' + JSON.stringify(responses))
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
      return response
    }
  }
}

const pendingLogics: StateLogic[] = []
function parseState (state) {
  debugMessage(`parseState(): state=${JSON.stringify(state)}`)

  state.logics.reverse().forEach(logic => {
    pendingLogics.unshift(logic)
  })
  debugMessage(`parseState(): pendingLogics=${JSON.stringify(pendingLogics)}`)

  while (pendingLogics.length > 0) {
    const currentLogic = pendingLogics.shift()
    if (currentLogic) {
      debugMessage(`parseState(): currentLogic=${JSON.stringify(currentLogic)}`)
      const conditionFulfilled = checkStateLogicCondition(currentLogic)
      let nextState: State | null = null
      if (conditionFulfilled) {
        if (currentLogic.messages && currentLogic.messages.length > 0) {
          // Parse messages here.
          parseMessages(currentLogic.messages)
        }
        if (currentLogic.responses && currentLogic.responses.length > 0) {
          const response = parseResponses(currentLogic.responses)
          if (response.clearState) {
            while (pendingLogics.length > 0) {
              debugMessage('parseState(): clearState is true, clearning pendingLogics...')
              pendingLogics.pop()
            }
          }

          // If there's a state associated with the response
          if (response.nextState) {
            nextState = stateMap[response.nextState]
          }
        }

        // If there was no state associated with response.
        // If there are 2 states defined through logic.response.nextState and logic.nextState, we use one
        // defined by logic.response
        if (!nextState) {
          nextState = stateMap[currentLogic.nextState]
        }

        if (nextState) {
          debugMessage(`parseState(): nextState=${JSON.stringify(nextState)}`)
          nextState.logics.reverse().forEach(logic => {
            pendingLogics.unshift(logic)
          })
        }
        debugMessage(`parseState(): pendingLogics=${JSON.stringify(pendingLogics)}`)
      }
    } else {
      throw new Error('Unexpected empty logic!')
    }
  }
}

// Start with main
let nextState: State = stateMap['MAIN']

while (true) {
  if (nextState) {
    parseState(nextState)
  } else {
    nextState = stateMap['MAIN']
  }
  // throw new Error('pause!')
}
