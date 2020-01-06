import fullStates from './states'

/* This is a shortened version of states, used for development purposes */
const states = fullStates

for (let i = 0; i < states.length; i++) {
  const state = states[i]
  if (state.id === 'MAIN_demographics') {
    state.logics = state.logics.slice(0, 4)
  } else if (state.id === 'MAIN_survey') {
    state.logics = state.logics.slice(0, 4)
    const end = {
      condition: null,
      messages: [
        `That's it! Thanks for taking your time to take this survey!`
      ],
      responses: [
        { type: 'button', text: `Alright!`, action: `processSurvey()` }
      ]
    } as any
    state.logics.push(end)
  }
}

export default states
