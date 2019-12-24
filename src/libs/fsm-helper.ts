import FSMStates, * as AllFSMStates from '../data/states-trimmed'
import * as vm from 'vm'
import * as _ from 'lodash'
const DEBUG = false

export default class {
  private static debugMessage (message) {
    if (DEBUG) {
      console.log(`[DEBUG] ${message}`)
    }
  }

  static executeAction (action, env) {
    // tslint:disable-next-line:no-eval
    return vm.runInNewContext(action, env)
    // return eval(action)
  }

  static checkStateLogicCondition (logic, userEnvironment) {
    // Condition is not defined
    if (!logic.condition) {
      return true
      // Condition is defined and is passed
    } else {
      // tslint:disable-next-line:no-eval
      this.debugMessage(`executeAction(): logic=${logic}`)
      const conditionPassed = this.executeAction(logic.condition, userEnvironment)
      if (conditionPassed) {
        return true
      } else {
        return false
      }
    }
  }

  private static parseStates (states: Array<State>): { [key: string]: State } {
    const hash = {}
    // Put each state on hashmap for easy access
    states.forEach(state => {
      hash[state.id] = state
    })
    return hash
  }

  static getMainState () {
    return this.getStateByName('MAIN')
  }

  static getStateByName (name) {
    const stateMap = this.parseStates(FSMStates)
    const mainState = _.cloneDeep(stateMap[name])
    if (mainState) {
      return mainState
    } else {
      throw new Error('Failed to retrieve main state!')
    }
  }

  /* getInitialRunningState (userId): RunningStates {
    const stateMap = this.parseStates(FSMStates)
    const mainState = stateMap['MAIN']
    let pendingLogics
    if (!mainState) {
      throw new Error('MAIN state is required!')
    } else {
      pendingLogics = mainState.logics
    }
    let currentLogic: StateLogic
    while (pendingLogics !== null) {
      // Parse each of the states until we encounter logic that we can execute
      currentLogic = pendingLogics.shift()
      if (currentLogic) {
        this.debugMessage(`parseState(): currentLogic=${JSON.stringify(currentLogic)}`)
        const conditionFulfilled = this.checkStateLogicCondition(currentLogic)
        if (conditionFulfilled) {
          return { currentLogic, pendingLogics }
        }
      }
    }
    throw new Error('Failed to generate initial running states! Double check your FSM states?')
  } */
}
