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

interface StateLogic {
  // Code that eval-ed to boolean
  condition?: string
  // Id of the following state
  nextState: string
  messages: string[]
  responses: Array<{
    type: 'button',
    text: string,
    nextState: string
  }>
}

// Represent a state in FSM
interface State {
  id: string
  logics: any
}