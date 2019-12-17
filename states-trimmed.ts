/* This is a shortened version of states, used for development purposes */

const state = {
  company: {
    name: 'P&G'
  }
}

const surveyResponsesTemplates = {
  template1: [
    { type: 'button', text: '5 - Strongly Agree', action: 'fillSurvey(surveySessionId, surveyTopicId, 5)' },
    { type: 'button', text: '4 - Agree', action: 'fillSurvey(surveySessionId, surveyTopicId, 4)' },
    { type: 'text', text: '3 - Neutral', action: 'fillSurvey(surveySessionId, surveyTopicId, 3)' },
    { type: 'text', text: '2 - Disagree', action: 'fillSurvey(surveySessionId, surveyTopicId, 2)' },
    { type: 'text', text: '1 - Strongly Disagree', action: 'fillSurvey(surveySessionId, surveyTopicId, 1)' }
  ],
  // Reverse scoring
  template2: [
    { type: 'button', text: '5 - Strongly Agree', action: 'fillSurvey(surveySessionId, surveyTopicId, 1)' },
    { type: 'button', text: '4 - Agree', action: 'fillSurvey(surveySessionId, surveyTopicId, 2)' },
    { type: 'text', text: '3 - Neutral', action: 'fillSurvey(surveySessionId, surveyTopicId, 3)' },
    { type: 'text', text: '2 - Disagree', action: 'fillSurvey(surveySessionId, surveyTopicId, 4)' },
    { type: 'text', text: '1 - Strongly Disagree', action: 'fillSurvey(surveySessionId, surveyTopicId, 5)' }
  ],
}

const states = [
  {
    id: "MAIN",
    logics: [
      {
        condition: 'state.didIntroduction !== true',
        nextState: 'MAIN_introduction'
      },
      {
        condition: 'state.didDemographics !== true',
        nextState: 'MAIN_demographics'
      },
      {
        condition: null,
        messages: [
          'How can I help you? :)'
        ],
        responses: [
          { type: 'button', text: 'Who are you again?', nextState: 'MAIN_introduction' },
          { type: 'button', text: 'Update my demographics information', nextState: 'MAIN_demographic' }

        ],
        nextState: null
      }
    ]
  },
  {
    id: 'MAIN_introduction',
    logics: [
      {
        condition: null,
        messages: [
          'Hi there, nice to meet you!',
          'My name is Cobbie, your personal assistant :)'
        ],
        responses: [
          { type: 'button', text: 'Nice to meet you too, Cobbie!'}
        ],
        nextState: null
      },
      {
        condition: null,
        messages: [
          'I\'m here to help you make ${state.company.name} the best place to work at!',
          `ll be asking you questions regarding to your experience <br>working at P&G. But don't fret, all the information is anonymous.<br>I am fully committed to protect your privacy :)<br><br><a href="googledocslinkhere">Learn More</a>`,
          'I will then use the collective feedbacks from employees at ${state.company.name} to provide feedback to the HRD, which in turn could make company-wide initiatives to make everyone healthier, happier, and more productive',
        ],
        responses: []
      },
      {
        condition: null,
        messages: [],
        responses: [],
        action: [
          {}
        ],
        nextState: 'MAIN_introduction_faq'
      }
    ]
  },
  {
    id: 'MAIN_introduction_faq',
    logics: [
      {
        condition: null,
        messages: [
          'What questions do you have for me? :)'
        ],
        responses: [
          { type: 'button', text: 'How can we help improving P&G?', nextState: 'MAIN_introduction_faq_how-cobbie-improve-corporation' },
          { type: 'button', text: 'Nope, no more question!', action: '' }
        ]
      }
    ]
  },
  {
    id: 'MAIN_introduction_faq_how-cobbie-improve-corporation',
    logics: [
      {
        condition: null,
        messages: [
          'We will help ${state.company.name} become a better place through collective feedbacks of its employees',
          'I will gather the experiences of all the employees throughout ${state.company.name}',
          'All of these data that are gathered anonymously will be collected, and analysed',
          `Through the analysis, I'll provide ${state.company.name} HRD with information on how it can be improved`
        ],
        responses: [
          { type: 'button', text: 'Got it!' }
        ]
      }
    ]
  },
  {
    id: 'MAIN_demographics',
    logics: [
      {
        condition: null,
        messages: [
          'Before we can start improving ${state.company.name}, could you please provide some demographics information? This will only take 5 minutes.',
          'And if you prefer not to answer a question, you can always skip it',
        ],
        responses: [
          { type: 'button', text: 'Sure!' },
          { type: 'button', text: `I'll do it later`, nextState: 'MAIN', clearState: true }
        ]
      },
      {
        condition: null,
        messages: [
          'How old are you?'
        ],
        responses: [
          { type: 'button', text: '18-24', action: `setDemographics('age', '18-24')` },
          { type: 'button', text: '25-34', action: `setDemographics('age', '25-34')` },
          { type: 'button', text: '35-44', action: `setDemographics('age', '35-44')` },
          { type: 'button', text: '45-54', action: `setDemographics('age', '45-54')` },
          { type: 'button', text: '54+', action: `setDemographics('age', '54+')` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('age', 'NA')` }
        ]
      },
      {
        condition: null,
        messages: [
          'What is your gender?'
        ],
        responses: [
          { type: 'button', text: 'Male', action: `setDemographics('gender', 'male')` },
          { type: 'button', text: 'Female', action: `setDemographics('gender', 'female')` },
          { type: 'text', text: 'Other', action: `setDemographics('gender', input)` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('age', 'NA')` }
        ]
      },
      {
        messages: [
          'Alright! Thanks for taking the time! :)'
        ]
      }
    ],
  },
  {
    id: 'MAIN_survey',
    logics: [
      {
        messages: [
          'To get started improving ${state.company.name}, I need you to provide honest feedback abour your working experience',
          `It's just as how very often people say that sharing is caring :)`,
          `This survey is going to take 10 minutes to complete and needs to be taken without distractions.`,
        ],
        responses: [
          { type: 'button', text: 'Sure thing, I have an undistracted 10 minutes!' },
          { type: 'button', text: 'Umm, who are you again?', nextState: 'MAIN_introduction' }
        ]
      }, {
        messages: [
          `I feel there's too much work to be completed`
        ],
        variables: {
          surveyTopicId: 1,
          surveyTopicName: 'Task Volume'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        messages: [
          `I often feel under pressure`
        ],
        variables: {
          surveyTopicId: 2,
          surveyTopicName: 'Task Volume'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        messages: [
          `There is not enough time to finish my tasks, projects, and assignments.`
        ],
        variables: {
          surveyTopicId: 3,
          surveyTopicName: 'Task Volume'
        },
        responses: surveyResponsesTemplates.template1
      }
    ]
  }
]

export default states