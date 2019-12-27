import * as vm from 'vm'

import * as _ from 'lodash'
import * as Promise from 'bluebird'
import * as fillTemplate from 'es6-dynamic-template'
import * as log from 'npmlog'

import FSMStates, * as AllFSMStates from '../data/states-trimmed'
const DEBUG = true
const TAG = 'FSMHelper'

// Helper functions related to FSM parsing
export default class {
  private static debugMessage (message) {
    if (DEBUG) {
      log.verbose(TAG, `[DEBUG] ${message}`)
    }
  }

  private static isPromise (obj) {
    return typeof obj === 'object' && 'then' in obj
  }

  static executeAction (action, env): Promise<any> {
    this.debugMessage(`executeAction(): action=${action} env=${JSON.stringify(env)}`)
    // tslint:disable-next-line:no-eval
    const result = vm.runInNewContext(action, env)
    // return eval(action)
    if (this.isPromise(result)) {
      return result
    } else {
      return Promise.resolve(result)
    }
  }

  static executeActionSync (action, env): any {
    return vm.runInNewContext(action, env)
  }

  static checkStateLogicCondition (logic, userEnvironment): boolean {
    // Condition is not defined
    if (!logic.condition) {
      return true
      // Condition is defined and is passed
    } else {
      // tslint:disable-next-line:no-eval
      this.debugMessage(`executeAction(): logic=${logic}`)
      return this.executeActionSync(logic.condition, userEnvironment)
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
      throw new Error('Failed to retrieve state: ' + name)
    }
  }

  static parseTemplateString (text, env): String {
    this.debugMessage(`parseTemplateString(): text=${text} env=${env}`)
    return fillTemplate(text, env)
  }

  static parseTemplateStrings (texts: string[], env): String[] {
    return texts.map(text => this.parseTemplateString(text, env))
  }
}
