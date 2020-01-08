const surveyResponsesTemplates = {
  template1: [
    { type: 'button', text: '5 - Strongly Agree', action: 'setSurvey(surveyTopicName, surveyTopicId, 5)' },
    { type: 'button', text: '4 - Agree', action: 'setSurvey(surveyTopicName, surveyTopicId, 4)' },
    { type: 'button', text: '3 - Neutral', action: 'setSurvey(surveyTopicName, surveyTopicId, 3)' },
    { type: 'button', text: '2 - Disagree', action: 'setSurvey(surveyTopicName, surveyTopicId, 2)' },
    { type: 'button', text: '1 - Strongly Disagree', action: 'setSurvey(surveyTopicName, surveyTopicId, 1)' }
  ],
  // Reverse scoring
  template2: [
    { type: 'button', text: '5 - Strongly Agree', action: 'setSurvey(surveyTopicName, surveyTopicId, 1)' },
    { type: 'button', text: '4 - Agree', action: 'setSurvey(surveyTopicName, surveyTopicId, 2)' },
    { type: 'button', text: '3 - Neutral', action: 'setSurvey(surveyTopicName, surveyTopicId, 3)' },
    { type: 'button', text: '2 - Disagree', action: 'setSurvey(surveyTopicName, surveyTopicId, 4)' },
    { type: 'button', text: '1 - Strongly Disagree', action: 'setSurvey(surveyTopicName, surveyTopicId, 5)' }
  ]
}

const states = [
  {
    id: 'MAIN',
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
        condition: 'state.didSurvey !== true',
        nextState: 'MAIN_survey'
      },
      {
        condition: null,
        messages: [
          'How can I help you? :)'
        ],
        responses: [
          { type: 'button', text: 'Who are you again?', nextState: 'MAIN_introduction' },
          { type: 'button', text: 'Update my demographics information', nextState: 'MAIN_demographics' },
          { type: 'button', text: 'Fill up the survey again', nextState: 'MAIN_survey' }
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
          { type: 'button', text: 'Nice to meet you too, Cobbie!' }
        ],
        nextState: null
      },
      {
        condition: null,
        messages: [
          'I\'m here to help you make ${company.name} the best place to work at!',
          'I will be asking you questions regarding to your experience working at ${company.name}. But don\'t fret, all the information is anonymous. I am fully committed to protect your privacy :) You can check http://googledocslink to learn more',
          'I will then use the collective feedbacks from employees at ${company.name} to provide feedback to the HRD, which in turn could make company-wide initiatives to make everyone healthier, happier, and more productive'
        ],
        responses: [
          { type: 'button', text: 'Got it!' }
        ]
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
          { type: 'button', text: 'How can we help improving ${company.name}?', nextState: 'MAIN_introduction_faq_how-cobbie-improve-corporation' },
          { type: 'button', text: 'Nope, no more question!', action: 'finishIntroduction()' }
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
          'We will help ${company.name} become a better place through collective feedbacks of its employees',
          'I will gather the experiences of all the employees throughout ${company.name}',
          'All of this data will be gathered anonymously and analysed',
          'I will analyze everyone\'s feedback and provide ${company.name} with information on how it can improve.'
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
          'Before we can start improving ${company.name}, could you please provide some demographics information? This will only take 5 minutes.',
          'And if you prefer not to answer a question, you can always skip it'
        ],
        responses: [
          { type: 'button', text: 'Sure!', action: 'createDemographics()' },
          { type: 'button', text: `I'll do it later`, nextState: 'MAIN', clearState: true }
        ]
      },
      {
        condition: null,
        messages: [
          'How old are you?'
        ],
        responses: [
          { type: 'button', text: '18-24', action: `setDemographics('age', [1, '18-24'])` },
          { type: 'button', text: '25-34', action: `setDemographics('age', [2, '25-34'])` },
          { type: 'button', text: '35-44', action: `setDemographics('age', [3, '35-44'])` },
          { type: 'button', text: '45-54', action: `setDemographics('age', [4, '45-54'])` },
          { type: 'button', text: '54+', action: `setDemographics('age', [5, '54+'])` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('age', ['', 'NA'])` }
        ]
      },
      {
        condition: null,
        messages: [
          'What is your gender?'
        ],
        responses: [
          { type: 'button', text: 'Male', action: `setDemographics('gender', [1, 'male'])` },
          { type: 'button', text: 'Female', action: `setDemographics('gender', [2, 'female'])` },
          // { type: 'text', text: 'Other', action: `setDemographics('gender', input)` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('gender', ['', 'NA'])` }
        ]
      },
      // In Singapore, this is not applicable
      /* {
        condition: null,
        messages: [
          'Are you Spanish or Latino?'
        ],
        responses: [
          { type: 'button', text: 'Yes', action: `setDemographics('spanishOrLatino', [1, true])` },
          { type: 'button', text: 'No', action: `setDemographics('spanishOrLatino', [2, false])` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('spanishOrLatino', ['', 'NA'])` }
        ]
      }, */
      // For now, we skipped over non-button responses, as it's not yet implemented!
      /* {
        condition: null,
        messages: [
          'What is your ethnicity?'
        ],
        responses: [
          { type: 'checkbox', text: 'African American', value: 'african-american', id: 'ethnicities' },
          { type: 'checkbox', text: 'Asian', value: 'asian', id: 'ethnicities' },
          { type: 'checkbox', text: 'Native American', value: 'native-american', id: 'ethnicities' },
          { type: 'checkbox', text: 'White', value: 'white', id: 'ethnicities' }
        ],
        action: `setDemographics('ethnicities', ethnicities)`
      }, */
      {
        condition: null,
        messages: [
          `What's your highest education?`
        ],
        responses: [
          { type: 'button', text: 'Less than highschool', action: `setDemographics('highestEducation', [1, 'less-than-highschool'])` },
          { type: 'button', text: 'Highschool diploma or equivalent', action: `setDemographics('highestEducation', [2, 'highschool-diploma'])` },
          { type: 'button', text: 'Bachelor degree', action: `setDemographics('highestEducation', [3, 'bachelor-degree'])` },
          { type: 'button', text: 'Master degree', action: `setDemographics('highestEducation', [4, 'master-degree'])` },
          { type: 'button', text: 'Doctorate degree', action: `setDemographics('highestEducation', [5, 'doctorate-degree'])` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('highestEducation', [6, 'NA'])` }
        ]
      },
      {
        condition: null,
        messages: [
          `What's your marital status?`
        ],
        responses: [
          { type: 'button', text: 'Married', action: `setDemographics('maritalStatus', [1, 'married'])` },
          { type: 'button', text: 'Divorced', action: `setDemographics('maritalStatus', [2, 'divorced'])` },
          { type: 'button', text: 'Separated', action: `setDemographics('maritalStatus', [3, 'separated'])` },
          { type: 'button', text: 'Widowed', action: `setDemographics('maritalStatus', [4, 'widowed'])` },
          { type: 'button', text: 'Single', action: `setDemographics('maritalStatus', [5, 'single'])` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('maritalStatus', [6, 'NA'])` }
        ]
      },
      {
        condition: null,
        messages: [
          'How many years have you been with ${company.name}?'
        ],
        responses: [
          { type: 'button', text: '0-2', action: `setDemographics('yearsWithCompany', [1, '0-2'])` },
          { type: 'button', text: '3-5', action: `setDemographics('yearsWithCompany', [2, '3-5'])` },
          { type: 'button', text: '6-10', action: `setDemographics('yearsWithCompany', [3, '6-10'])` },
          { type: 'button', text: '11-15', action: `setDemographics('yearsWithCompany', [4, '11-15'])` },
          { type: 'button', text: '15+', action: `setDemographics('yearsWithCompany', [5, '15+'])` },
          { type: 'button', text: 'I prefer not to say', action: `setDemographics('yearsWithCompany', [6, 'NA'])` }
        ]
      },
      {
        condition: null,
        messages: [
          `That's it! Thanks for taking the time to fill up the demographics :)`
        ],
        responses: [
          { type: 'button', text: 'Alright!', nextState: 'MAIN', clearState: true }
        ]
      }
    ]
  },
  {
    id: 'MAIN_survey',
    logics: [
      {
        messages: [
          'To get started improving ${company.name}, I need you to provide honest feedback abour your working experience',
          `It's just as how very often people say that sharing is caring :)`,
          `This survey is going to take 10 minutes to complete and needs to be taken without distractions.`
        ],
        responses: [
          { type: 'button', text: 'Sure thing, I have an undistracted 10 minutes!', action: 'createSurvey()' },
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
      }, {
        messages: [
          `I control how my work is completed`
        ],
        variables: {
          surveyTopicId: 4,
          surveyTopicName: 'Control'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I am involved in decisions that impact myself and my colleagues.`
        ],
        variables: {
          surveyTopicId: 5,
          surveyTopicName: 'Control'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `Successful people at my company can control their careers.`
        ],
        variables: {
          surveyTopicId: 6,
          surveyTopicName: 'Control'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `My pay is equal to the work I do.`
        ],
        variables: {
          surveyTopicId: 7,
          surveyTopicName: 'Pay and Incentives'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `People at the office appreciate the work I do.`
        ],
        variables: {
          surveyTopicId: 8,
          surveyTopicName: 'Pay and Incentives'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `I feel I can progress and grow at the company`
        ],
        variables: {
          surveyTopicId: 9,
          surveyTopicName: 'Pay and Incentives'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `I am comfortable communicating with those I work closely with.`
        ],
        variables: {
          surveyTopicId: 10,
          surveyTopicName: 'Community'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I consider those I work with as my friends.`
        ],
        variables: {
          surveyTopicId: 11,
          surveyTopicName: 'Community'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I feel comfortable around others at work.`
        ],
        variables: {
          surveyTopicId: 12,
          surveyTopicName: 'Community'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I feel there is little favoritism at work.`
        ],
        variables: {
          surveyTopicId: 13,
          surveyTopicName: 'Justice'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `The leadership in my organization treats all employees equally.`
        ],
        variables: {
          surveyTopicId: 14,
          surveyTopicName: 'Justice'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `People at work view me in a professional manner.`
        ],
        variables: {
          surveyTopicId: 15,
          surveyTopicName: 'Justice'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I feel my values align with the organization.`
        ],
        variables: {
          surveyTopicId: 16,
          surveyTopicName: 'Standards'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `The purpose and mission of the organization inspire me.`
        ],
        variables: {
          surveyTopicId: 17,
          surveyTopicName: 'Standards'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I am likely to recommend my organization as a good place to work.`
        ],
        variables: {
          surveyTopicId: 18,
          surveyTopicName: 'Standards'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I feel emotionally drained after work.`
        ],
        variables: {
          surveyTopicId: 19,
          surveyTopicName: 'Exhaustion'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `I feel tired in the morning knowing I have to go to work.`
        ],
        variables: {
          surveyTopicId: 20,
          surveyTopicName: 'Exhaustion'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `Everything I do at work requires a lot of energy.`
        ],
        variables: {
          surveyTopicId: 21,
          surveyTopicName: 'Exhaustion'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `I view people at work as objects.`
        ],
        variables: {
          surveyTopicId: 22,
          surveyTopicName: 'Depersonalization'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `At work, I am more uncaring.`
        ],
        variables: {
          surveyTopicId: 23,
          surveyTopicName: 'Depersonalization'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `I do not care what happens to people at work.`
        ],
        variables: {
          surveyTopicId: 24,
          surveyTopicName: 'Depersonalization'
        },
        responses: surveyResponsesTemplates.template1
      }, {
        condition: null,
        messages: [
          `I deal with people at work effectively.`
        ],
        variables: {
          surveyTopicId: 25,
          surveyTopicName: 'Personal Accomplishment'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `I feel my own work has an impact.`
        ],
        variables: {
          surveyTopicId: 26,
          surveyTopicName: 'Personal Accomplishment'
        },
        responses: surveyResponsesTemplates.template2
      }, {
        condition: null,
        messages: [
          `My organziation makes me feel excited to work.`
        ],
        variables: {
          surveyTopicId: 27,
          surveyTopicName: 'Personal Accomplishment'
        },
        responses: surveyResponsesTemplates.template2
      },
      {
        condition: null,
        messages: [
          `That's it! Thanks for taking your time to take this survey!`
        ],
        responses: [
          { type: 'button', text: `Alright!`, action: `processSurvey()` }
        ]
      }
    ]
  },
  {
    id: 'MAIN_goodbye',
    logics: [
      {
        condition: null,
        messages: [
          'Okay then! :)',
          'See you later!'
        ],
        responses: [
          { type: 'button', text: 'Bye!' }
        ],
        nextState: null
      }
    ]
  }
]

export default states
export {
  surveyResponsesTemplates
}
