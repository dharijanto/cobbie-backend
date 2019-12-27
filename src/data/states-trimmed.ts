import fullStates, { state } from './states'

/* This is a shortened version of states, used for development purposes */
const states = fullStates

for (let i = 0; i < states.length; i++) {
  const state = states[i]
  if (state.id === 'MAIN_demographics') {
    state.logics = state.logics.slice(0, 4)
  } else if (state.id === 'MAIN_survey') {
    state.logics = state.logics.slice(0, 4)
  }
}

export default states
export {
  state
}
