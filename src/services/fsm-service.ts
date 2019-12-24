import CRUDService from './crud-service'
import * as Promise from 'bluebird'

import FSMHelper from '../libs/fsm-helper'
import Utils from '../libs/utils'

import * as log from 'npmlog'

interface FrontendAction {
  timestamp: number
  messages: Array<String>
  responses: Array<{ type: string, text: string }>
}

const TAG = 'FSMService'
class FSMService extends CRUDService {
  getCurrentFrontendAction (userId: number): Promise<NCResponse<FrontendAction>> {
    if (userId) {
      return this.getUserEnvironment(userId).then(resp => {
        if (resp.status && resp.data) {
          const userEnv = resp.data
          return this.getSavedRunningStates(userId).then(resp2 => {
            if (resp2.status && resp2.data) {
              return { status: true, data: resp2.data }
            } else {
              // There's no saved running states
              const runningStates: RunningStates = this.generateNewRunningStates(userEnv)
              // Retain it to the database
              return this.saveRunningStates(userId, runningStates)
            }
          }).then((resp: NCResponse<RunningStates>) => {
            if (resp.status && resp.data) {
              return this.getFrontendAction(resp.data)
            } else {
              return { status: false, errMessage: resp.errMessage }
            }
          })
        } else {
          return Promise.resolve({ status: false, errMessage: 'Failed to retrieve userEnvironment: ' + resp.errMessage })
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'userId is required!' })
    }
  }

  // Retrieved executing states stored in the database
  private getSavedRunningStates (userId): Promise<NCResponse<RunningStates>> {
    if (userId) {
      return super.readOne<any>('SerializedRunningStates', { userId }).then(resp => {
        log.verbose(TAG, `getSavedRunningStates(): userId=${userId} resp=${JSON.stringify(resp)}`)
        if (resp.status && resp.data) {
          const currentLogic = JSON.parse(resp.data.currentLogic)
          const pendingLogics = JSON.parse(resp.data.pendingLogics)
          return { status: true, data: {
            id: resp.data.id,
            timestamp: resp.data.timestamp,
            pendingLogics,
            currentLogic,
            createdAt: resp.data.createdAt,
            updatedAt: resp.data.updatedAt,
            userId: resp.data.userId
          }}
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'userId is not defined!' })
    }
  }

  // Get frontend action based on running states
  private getFrontendAction (runningStates: RunningStates): NCResponse<FrontendAction> {
    log.verbose(TAG, `getFrontendAction(): runningStates=${JSON.stringify(runningStates)}`)
    if (runningStates) {
      return {
        status: true,
        data: {
          timestamp: runningStates.timestamp,
          messages: runningStates.currentLogic.messages,
          responses: runningStates.currentLogic.responses.map(response => {
            return { type: 'button', text: '' + response.text }
          })
        }
      }
    } else {
      throw new Error('runningStates is required!')
    }
  }

  private getUserEnvironment (userId): Promise<NCResponse<UserEnvironment>> {
    // Get user's company info
    return Promise.join<NCResponse<any>>(
      super.readOne<Company>('Company', { userId }),
      super.readOne<User>('User', { id: userId }),
      super.rawReadOneQuery(`SELECT * FROM demographics WHERE userId=${userId} ORDER BY createdAt DESC LIMIT 1`)
    ).spread((resp1: NCResponse<Company>, resp2: NCResponse<User>, resp3: NCResponse<Demographics>) => {
      if (resp2.status && resp2.data) {
        if (resp1.status && resp1.data) {
          return {
            status: true,
            data: {
              company: {
                name: resp1.data.name
              },
              state: {
                isIntroduced: resp2.data.didIntroduction
              }
            }
          }
        } else {
          return { status: false, errMessage: `userId=${userId} doesn't have company defined!` }
        }
      } else {
        return { status: false, errMessage: `userId=${userId} doesn't exist!` }
      }
    })
  }

  // We don't wanna delete state history because they can be used to do bug-fixing
  private saveRunningStates (userId: number, runningStates: RunningStates): Promise<NCResponse<RunningStates>> {
    return super.create<SerializedRunningStates>('RunningStates', {
      timestamp: runningStates.timestamp,
      pendingLogics: JSON.stringify(runningStates.pendingLogics),
      currentLogic: JSON.stringify(runningStates.currentLogic),
      userId
    }).then(resp => {
      if (resp.status) {
        return { status: true, data: runningStates }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
    /* return super.readOne<SerializedRunningStates>('RunningStates', { userId }).then(resp => {
      if (resp.status && resp.data) {
        return super.delete<SerializedRunningStates>('RunningStates', { userId })
      } else {
        return Promise.resolve({ status: true })
      }
    }).then(() => {
      return super.create<SerializedRunningStates>('RunningStates', {
        timestamp: runningStates.timestamp,
        pendingLogics: JSON.stringify(runningStates.pendingLogics),
        currentLogic: JSON.stringify(runningStates.currentLogic),
        userId
      }).then(resp => {
        if (resp.status) {
          return { status: true, data: runningStates }
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    }) */
  }

  // TODO: Should we save?
  private generateNewRunningStates (userEnvironment): RunningStates {
    const mainState = FSMHelper.getMainState() // this.parseStates(FSMStates)
    log.verbose(TAG, `generateNewRunningStates(): mainState=${JSON.stringify(mainState)}`)
    let pendingLogics
    if (!mainState) {
      throw new Error('MAIN state is required!')
    } else {
      pendingLogics = [].concat(mainState.logics)
    }
    let currentLogic: StateLogic
    log.verbose(TAG, `generateNewRunningStates(): pendingLogics=${JSON.stringify(pendingLogics)}`)
    while (pendingLogics !== null) {
      // Parse each of the states until we encounter logic that we can execute
      currentLogic = pendingLogics.shift()
      if (currentLogic) {
        log.verbose(TAG, `generateNewRunningStates(): currentLogic=${JSON.stringify(currentLogic)}`)
        // this.debugMessage(`parseState(): currentLogic=${JSON.stringify(currentLogic)}`)
        const conditionFulfilled = FSMHelper.checkStateLogicCondition(currentLogic, userEnvironment)
        log.verbose(TAG, `generateNewRunningStates(): conditionFulfilled=${conditionFulfilled}`)
        if (conditionFulfilled) {
          // Some actions are needed from frontend
          if ((currentLogic.messages && currentLogic.messages.length > 0) ||
              (currentLogic.responses && currentLogic.responses.length > 0)) {
            return { timestamp: Utils.getCurrentTimestamp(),currentLogic, pendingLogics }
          } else {
            // Parse until we encounter something that requires user's action
            let nextState: State | null = null
            if (currentLogic.nextState) {
              nextState = FSMHelper.getStateByName(currentLogic.nextState) // stateMap[response.nextState]
              log.verbose(TAG, `generateNewRunningStates(): nextState=${JSON.stringify(nextState)}`)
              nextState.logics.reverse().forEach(logic => {
                pendingLogics.unshift(logic)
              })
            }
          }
        }
      }
    }
    throw new Error('Failed to generate initial running states! Double check your FSM states?')
  }
}

export default new FSMService()
