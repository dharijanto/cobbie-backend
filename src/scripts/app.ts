import * as Promise from 'bluebird'
import * as readline from 'readline'
import TrimmedStates from '../data/states-trimmed'

function onStateChange (newState) {
}

function parseStates (states: Array<State>): { [key: string]: State } {
  const hash = {}
  // Put each state on hashmap for easy access
  states.forEach(state => {
    hash[state.id] = state
  })

  return hash
}

const stateMap = parseStates(TrimmedStates)

// This is prototype code for parsing the state machine

// Return 'true' if logic condition is met
function checkStateLogicCondition (logic) {
  // Condition is not defined
  if (!logic.condition) {
    return true
    // Condition is defined and is passed
  } else if (logic.condition) {
    console.log(`parseLogic(): eval(${logic.condition})`)
    // tslint:disable-next-line:no-eval
    const conditionPassed = eval(logic.condition)
    if (conditionPassed) {
      return true
    }
  }
}

// Print out each of the messages one by one, but delay first according to the message
// length
function parseMessages (messages: string[]) {
  messages.reduce((acc, message) => {
    return acc.then(() => {
      return Promise.delay(message.length * 10).then(() => {
        return console.log(message)
      })
    })
  }, Promise.resolve())
}

function parseResponses (responses: any[]): State {
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

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(`Which one is your reponse? ${Object.stringify(Object.keys(responseMap))}`, answer => {
    const response = responseMap[parseInt(answer, 10)]
    if (!response) {
      throw new Error('Invalid response: ' + response)
    } else {
      
    }
  })
}

function parseState (state) {
  // Evaluate each of the logics
  nextState.logics.forEach((logic, index) => {
    // Check on the condition
    const conditionFulfilled = checkStateLogicCondition(logic)
    if (conditionFulfilled) {
      const nextState = stateMap[logic.nextState]
      if (nextState !== null) {
        parseState(nextState)
      } else if (logic.messages && logic.messages.length > 0) {
        // Parse messages here.
        parseMessages(logic.messages)
        parseResponses(logic.responses)
      } else {
        throw new Error()
      }
    }
  })
}

// Start with main
let nextState: State = stateMap['MAIN']

while (true) {

  if (nextState )
}

