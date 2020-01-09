interface NCResponse<T> {
  status: boolean,
  data?: T,
  errMessage?: string
  errCode?: number
}

interface BaseModel {
  id: number,
  createdAt: string,
  updatedAt: string
}

interface Company extends BaseModel {
  name: string
  uniqueCode: string
  employeesCount: number
  userId: number
}

interface User extends BaseModel {
  username: string
  saltedPass: string
  salt: string
  didIntroduction: boolean
  companyId: number
}

interface Demographics extends BaseModel {
  value: string
  userId: number
}

interface Survey extends BaseModel {
  // Stringified json of the survey data
  value: string
  // Stringified json of the result
  result: string
  userId: number
}

// TODO: Use this type definition on FSMService
interface UserEnvironment {
  company: {
    name: string
  }
}

// If there are 2 states defined through logic.response.nextState and logic.nextState, we use one
// defined by logic.response
interface StateLogic {
  // Code that eval-ed to boolean
  condition?: string
  // Id of the following state
  nextState?: string
  messages: string[]
  variables?: object
  responses: Array<StateLogicResponse>
  clearState?: boolean
  action?: string
}

interface StateLogicResponse {
  type: 'button' | 'text'
  text?: string
  action?: string
  clearState?: boolean
  nextState?: string
}

interface State {
  id: string
  logics: any
}

// Represent a state in FSM
interface RunningStates {
  // id?: string
  timestamp: number
  pendingLogics: StateLogic[]
  currentLogic: StateLogic
}

interface SerializedRunningStates extends BaseModel {
  userId: number
  timestamp: number
  pendingLogics: string
  currentLogic: string
}

type FrontendResponseType = 'nop' | 'button' | 'checkbox' | 'text'
interface FrontendResponse extends BaseModel {
  timestamp: number
  type: FrontendResponseType
  responseIndex?: number
  responseIndexes?: number[]
  data?: string
}

interface SerializedFrontendResponse extends BaseModel {
  timestamp: number
  type: FrontendResponseType
  responseIndex?: number
  responseIndexes?: string
  data?: string
}