# FSM
## Requirements
From current business requirement, we'd need to be able to separate the states into different levels.

L1: MAIN, DEMOGRAPHICS, SURVEY, PERSONAL LIBRARY
L2: SURVEY:
      AOW, BO, 2Q
    PERSONAL LIBRARY:
      NEW CONTENT, RECOMMENDER

## Concepts
### FSM
-L1: This is the top-most states. Each can have its own child states.

-MAIN is the entry point of the app. It's like the default state the user will be in when they
first use the app. It will have the navigation logic of which state to transition initially.

-To make things managable, we'll have L1 states to only be able to navigate either to:
 its child states or go back to MAIN. This helps reducing the potential of creating dependency hell because
 then each state would be self-dependent while the glue between states is just MAIN. So when we need to remove/add
 new states, we can easily glue them with them program through the MAIN state.

-This whole thing can be represented/visualized by drawing a directed graph. Then after
 the business side / Alan does the coding, we can visualize how the entire thing will tie together
 even before running the application

### User State & Functions
Each of the information regarding a user is persisted in a database. How it's stored is outside of the scope
of this document (i.e. MySQL, Firebase, etc). We'll only talk about how it's represented and used.

To make complex program, when state needs to transition to other states, it needs more information
to figure out which state to move into. For example, we're at MAIN and want to move to DEMOGRAPHIC
when user hasn't filled up their demographics information yet. Here, it would mean that when demographics field
on user state is null, we'll do that. But since at some point we'll have more data than
we can pre-load into the state, we might resort
into creating functions that FSM programmer can use, which would do asynchronous operation on call.

### Examples
```
USER STATE:
{
  company: {
    name: "P&G"
  },
  didIntroduction: false,
  demographics: {
    age,
    gender,
    lengthInCompany
  },
}

FSM:
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
      condition: null
      messages: [
        'How can I help you? :)'
      ],
      responses: [
        { type: 'button', text: 'Who are you again?', action: 'MAIN_introduction' },
        { type: 'button', text: 'Update my demographics information', action: 'MAIN_demographic' }

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
        'll be asking you questions regarding to your experience <br>working at P&G. But don't fret, all the information is anonymous.<br>I am fully committed to protect your privacy :)<br><br><a href="googledocslinkhere">Learn More</a>',
        'I will then use the collective feedbacks from employees at ${state.company.name} to provide feedback to the HRD, which in turn could make company-wide initiatives to make everyone healthier, happier, and more productive',
      ],
      responses: []
    },
    {
      condition: null,
      messages: [],
      responses: [],
      action: [
        {  }
      ]
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
        'Through the analysis, I'll provide ${state.company.name} HRD with information on how it can be improved'
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
      ]
      responses: [
        { type: 'button', text: 'Sure!' },
        { type: 'button', text: 'I'll do it later', nextState: 'MAIN', clearState: true }
      ]
    },
    {
      condition: null,
      messages: [
        'How old are you?'
      ],
      responses: [
        { type: 'button', text: '18-24', action: setDemographics('age', '18-24') },
        { type: 'button', text: '25-34', action: setDemographics('age', '25-34') },
        { type: 'button', text: '35-44', action: setDemographics('age', '35-44') },
        { type: 'button', text: '45-54', action: setDemographics('age', '45-54') },
        { type: 'button', text: '54+', action: setDemographics('age', '54+') },
        { type: 'button', text: 'I prefer not to say', action: setDemographics('age', 'NA') }
      ]
    },
    {
      condition: null,
      messages: [
        'What is your gender?'
      ],
      responses: [
        { type: 'button', text: 'Male', action: setDemographics('gender', 'male') },
        { type: 'button', text: 'Female', action: setDemographics('gender', 'female') },
        { type: 'text', text: 'Other', action: setDemographics('gender', '${input}') },
        { type: 'button', text: 'I prefer not to say', action: setDemographics('age', 'NA') }
      ]
    },
    {
      condition: null,
      messages: [
        'Are you Spanish or Latino?'
      ],
      responses: [
        { type: 'button', text: 'Yes', action: setDemographics('spanishOrLatino', true) },
        { type: 'button', text: 'No', action: setDemographics('spanishOrLatino', false) },
        { type: 'button', text: 'I prefer not to say', action: setDemographics('spanishOrLatino', 'NA') }
      ]
    },
    {
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
      action: 'setDemographics('ethnicity', ethnicities)
    },
    {
      condition: null,
      messages: [
        'What's your highest education?'
      ],
      responses: [
        { type: 'button', text: 'Less than highschool', action: setDemographics('highestEducation', 'less-than-highschool') },
        { type: 'button', text: 'Highschool diploma or equivalent', action: setDemographics('highestEducation', 'highschool-diploma') },
        { type: 'text', text: 'Bachelor degree', action: setDemographics('highestEducation', 'bachelor-degree') },
        { type: 'text', text: 'Master degree', action: setDemographics('highestEducation', 'master-degree') },
        { type: 'text', text: 'Doctorate degree', action: setDemographics('highestEducation', 'doctorate-degree') },
        { type: 'button', text: 'I prefer not to say', action: setDemographics('highestEducation', 'NA') }
      ]
    },
    {
      condition: null,
      messages: [
        'What's your marital status?'
      ],
      responses: [
        { type: 'button', text: 'Married', action: setDemographics('maritalStatus', 'married') },
        { type: 'button', text: 'Divorced', action: setDemographics('maritalStatus', 'divorced') },
        { type: 'text', text: 'Separated', action: setDemographics('maritalStatus', 'separated') },
        { type: 'text', text: 'Widowed', action: setDemographics('maritalStatus', 'widowed') },
        { type: 'text', text: 'Single', action: setDemographics('maritalStatus', 'single') },
        { type: 'button', text: 'I prefer not to say', action: setDemographics('maritalStatus', 'NA') }
      ]
    },
    {
      condition: null,
      messages: [
        'How many years have you been with ${state.company.name}?'
      ],
      responses: [
        { type: 'button', text: '0-2', action: setDemographics('yearsWithCompany', '0-2') },
        { type: 'button', text: '3-5', action: setDemographics('yearsWithCompany', '3-5') },
        { type: 'text', text: '6-10', action: setDemographics('yearsWithCompany', '6-10') },
        { type: 'text', text: '11-15', action: setDemographics('yearsWithCompany', '11-15') },
        { type: 'text', text: '15+', action: setDemographics('yearsWithCompany', '15+') },
        { type: 'button', text: 'I prefer not to say', action: setDemographics('yearsWithCompany', 'NA') }
      ]
    },
  ],
},
{
  id: 'MAIN_survey',
  logics: [
    {
      messages: [
        'To get started improving ${state.company.name}, I need you to provide honest feedback abour your working experience',
        'It's just as how very often people say that sharing is caring :)',
        'This survey is going to take 10 minutes to complete and needs to be taken without distractions.',
      ]
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
        surveyTopicName: 'Community
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
        `People at work me in a professional manner.`
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
    }
  ]
}

surveyResponsesTemplates: {
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
```

### FSM Notes:
clearStack: true: // By default, when there's no more logics in a state, it will go back to whatever previous state that leads to it. So if you want to clear out remembered states, set this to true

### Parsing
For UI presentation, we can do several things to make visual improvements:
1. Create an effect as if the bot is typing. The length of typing is correlated to the length of the sentence
2.

# API Design
## Endpoints
### [GET] /api/v1/chatbot/current-state
* Response:
```
{
  messages: [
    'Hi there, nice to meet you!',
    'My name is Cobbie, your personal assistant :)'
  ],
  responses: [
    { type: 'button', text: 'Nice to meet you too, Cobbie!'}
  ]
}
```

### [POST] /api/v1/chatbot/current-state
* Body
```
{
  index: 0,
  data: {
    text: 'This is filled only if the response is of type free-text'
  }
}
```