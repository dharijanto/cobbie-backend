import CRUDService from './crud-service'
import * as Promise from 'bluebird'

import FSMHelper from '../libs/fsm-helper'
import Utils from '../libs/utils'
import * as _ from 'lodash'

import * as log from 'npmlog'
import demographicsService from './demographics-service'
import userService from './user-service'
import surveyService from './survey-service'

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
              return this.getFrontendAction(resp.data, userEnv)
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

  submitFrontendResponse (userId: number, response: FrontendResponse): Promise<NCResponse<FrontendAction>> {
    log.verbose(TAG, `submitFrontendResponse(): userId=${userId} response=${JSON.stringify(response)}`)
    /* if (!response || !('responseIndex' in response)) {
      return Promise.resolve({ status: false, errMessage: 'Invalid response!' })
    } else { */
    if (userId) {
      return this.getUserEnvironment(userId).then(resp => {
        if (resp.status && resp.data) {
          const userEnv = resp.data
          return this.getSavedRunningStates(userId).then(resp2 => {
            if (resp2.status && resp2.data) {
              return this.updateRunningStates(resp2.data, response, userEnv).then(resp3 => {
                if (resp3.status && resp3.data) {
                  return this.saveRunningStates(userId, resp3.data).then(resp4 => {
                    if (resp4.status && resp4.data) {
                      return this.getFrontendAction(resp4.data, userEnv)
                    } else {
                      return { status: false, errMessage: `Failed to saveRunningStates: ${resp4.errMessage}` }
                    }
                  })
                  // TODO: Also save response that was used to generate this RunningStates
                } else {
                  return { status: false, errMessage: 'Failed to updateRunningStates(): ' + resp3.errMessage }
                }
              })
            } else {
              return { status: false, errMessage: `There is RunningStates to be responded!` }
            }
          })
        } else {
          return Promise.resolve({ status: false, errMessage: 'Failed to retrieve userEnvironment: ' + resp.errMessage })
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'userId is required!' })
    }
    // }
  }

  // Retrieved executing states stored in the database
  private getSavedRunningStates (userId): Promise<NCResponse<RunningStates>> {
    if (userId) {
      return super.rawReadOneQuery(
        `SELECT * FROM serializedRunningStates WHERE userId=${userId} ORDER BY timestamp DESC LIMIT 1`
      ).then(resp => {
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
  private getFrontendAction (runningStates: RunningStates, userEnv: UserEnvironment): NCResponse<FrontendAction> {
    log.verbose(TAG, `getFrontendAction(): runningStates=${JSON.stringify(runningStates)}`)
    if (runningStates) {
      return {
        status: true,
        data: {
          timestamp: runningStates.timestamp,
          messages: FSMHelper.parseTemplateStrings(runningStates.currentLogic.messages, userEnv),
          responses: runningStates.currentLogic.responses.map(response => {
            return { type: response.type, text: FSMHelper.parseTemplateString(response.text, userEnv) }
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
      super.rawReadOneQuery(`SELECT * FROM demographics WHERE userId=${userId} ORDER BY createdAt DESC LIMIT 1`),
      super.rawReadOneQuery(`SELECT * FROM surveys WHERE userId=${userId} ORDER BY createdAt DESC LIMIT 1`)
    ).spread((resp1: NCResponse<Company>, resp2: NCResponse<User>,
              resp3: NCResponse<Demographics>, resp4: NCResponse<Survey>) => {
      if (resp2.status && resp2.data) {
        if (resp1.status && resp1.data) {
          return {
            status: true,
            data: {
              company: {
                name: resp1.data.name
              },
              state: {
                didIntroduction: resp2.data.didIntroduction,
                didDemographics: resp3.status,
                didSurvey: resp4.status
              },
              createDemographics: function () {
                return demographicsService.createDemographics(userId)
              },
              setDemographics: function (key, value) {
                return demographicsService.setDemographics(userId, key, value)
              },
              finishIntroduction: function () {
                return userService.finishIntroduction(userId)
              },
              createSurvey: function () {
                return surveyService.createSurvey(userId)
              },
              setSurvey: function (topicName, topicId, value) {
                return surveyService.setSurvey(userId, topicName, topicId, value)
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
    return super.create<SerializedRunningStates>('SerializedRunningStates', {
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
  }

  // Given pendingLogics, generate RunningStates
  private generateRunningStates (pendingLogicsOrig, userEnvironment): RunningStates {
    log.verbose(TAG, `generateRunningStates(): pendingLogicsOrig=${JSON.stringify(pendingLogicsOrig)}` +
      ` userEnvironment=${JSON.stringify(userEnvironment)}`)
    const pendingLogics = _.cloneDeep(pendingLogicsOrig)
    let currentLogic
    while (pendingLogics.length > 0) {
      log.verbose(TAG, `generateRunningStates(): pendingLogics=${JSON.stringify(pendingLogics)}`)
      // Parse each of the states until we encounter logic that we can execute
      currentLogic = pendingLogics.shift()
      if (currentLogic) {
        log.verbose(TAG, `generateNewRunningStates(): currentLogic=${JSON.stringify(currentLogic)}`)
        // this.debugMessage(`parseState(): currentLogic=${JSON.stringify(currentLogic)}`)
        const conditionFulfilled = FSMHelper.checkStateLogicCondition(currentLogic, userEnvironment)
        log.verbose(TAG, `generateNewRunningStates(): condition=${JSON.stringify(currentLogic.condition)} conditionFulfilled=${conditionFulfilled}`)
        if (conditionFulfilled) {
          // Some actions are needed from frontend
          if ((currentLogic.messages && currentLogic.messages.length > 0) ||
              (currentLogic.responses && currentLogic.responses.length > 0)) {
            return { timestamp: Utils.getCurrentTimestamp(), currentLogic, pendingLogics }
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

    throw new Error('Failed to retrieve RunningStates!')
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
    return this.generateRunningStates(pendingLogics, userEnvironment)
  }

  private updateRunningStates (runningStates: RunningStates,
      frontendResponse: FrontendResponse, userEnv: UserEnvironment): Promise<NCResponse<RunningStates>> {
    return FSMHelper.validateFrontendResponse(frontendResponse, runningStates.currentLogic.responses).then(resp => {
      if (resp.status) {
        let nextState
        let responseAction: Promise<any> = Promise.resolve()
        const stateVariables = runningStates.currentLogic.variables || {}
        const pendingLogics = _.cloneDeep(runningStates.pendingLogics)
        if (frontendResponse.type === 'nop') {
          // Nothing
        } else if (frontendResponse.type === 'button') {
          if (frontendResponse.responseIndex === undefined) {
            return { status: false, errMessage: 'responseIndex is required!' }
          } else {
            const response = runningStates.currentLogic.responses[frontendResponse.responseIndex]
            // Execute action embedded on the selected response
            if (response.action) {
              responseAction = FSMHelper.executeAction(response.action, { ...userEnv, ...stateVariables })
            }
            // If selected response request state to be cleared
            if (response.clearState) {
              while (pendingLogics.length > 0) {
                log.verbose(TAG, 'updateRunningStates(): clearState is true, clearning pendingLogics...')
                pendingLogics.pop()
              }
            }
            // If selected repsonse has a specified nextState
            if (response.nextState) {
              nextState = FSMHelper.getStateByName(response.nextState)
            }
          }
        } else if (frontendResponse.type === 'checkbox') {
          // TODO
          // 1. Accumulate selected checkboxes data into object
          // 2. Pass the object when parsing StateLogic's action.
          // 3. Execute StateLogic's action
          throw new Error('Not yet implemented!')
        } else if (frontendResponse.type === 'text') {
          throw new Error('Not yet implemented!')
        } else {
          return { status: false, errMessage: `Invalid frontendResponse.type=${frontendResponse.type}` }
        }
        // If there isn't state specified by selected response, we use nextState specified by the State
        if (!nextState && runningStates.currentLogic.nextState) {
          nextState = FSMHelper.getStateByName(runningStates.currentLogic.nextState)
        }

        if (nextState) {
          log.verbose(TAG, `updateRunningStates(): nextState=${JSON.stringify(nextState)}`)
          // After a jump, we want to go back to the same state
          pendingLogics.unshift(runningStates.currentLogic)
          nextState.logics.reverse().forEach(logic => {
            pendingLogics.unshift(logic)
          })
        }

        return responseAction.then(() => {
          // TODO: Update the state
          let runningStates: RunningStates
          try {
            runningStates = this.generateRunningStates(pendingLogics, userEnv)
          } catch (e) {
            log.info(TAG, `updateRunningStates(): No more states! Loop back to main state!`)
            runningStates = this.generateNewRunningStates(userEnv)
          }
          return { status: true, data: runningStates } as NCResponse<RunningStates>
        })
      } else {
        return { status: false, errMessage: `Invalid frontendResponse: ${resp.errMessage}` }
      }
    })
  }
}

export default new FSMService()
