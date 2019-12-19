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
}

interface User extends BaseModel {

}

interface Demographics extends BaseModel {
  key: string
  value: string
  userId: number
}

interface StateResponseButton {

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

// Represent a state in FSM
interface State {
  id: string
  logics: any
}