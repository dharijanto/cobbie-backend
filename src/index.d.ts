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
  employeesCount: number
  userId: number
}

interface User extends BaseModel {
  didIntroduction: boolean
}

interface Demographics extends BaseModel {
  value: string
  userId: number
}

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
  nextState: string
  messages: string[]
  responses: Array<StateLogicResponse>
  clearState?: boolean
}

interface StateLogicResponse {
  type: 'button',
  text?: string,
  clearState?: boolean
  nextState: string
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

interface FrontendResponses extends BaseModel {
  timestamp: number
  value: string
}