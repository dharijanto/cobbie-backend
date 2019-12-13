# FSM
## Requirements
From current business requirement, we'd need to be able to separate the states into different levels.
Initially there will be 2 levels (parent & child), but for further development there might be more.

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
when user hasn't filled up their demographics information yet. Here, it would means that when demographics field
on user state is null, we'll do that. But since we can't pre-load everything into the state, we might resort
into creating functions that FSM programmer can use.

functions: {
  demographics
}

### Examples
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
  // The logic is iterated in the same order as what it appears on the array
  logics: [
    {
      condition: 'state.didIntroduction !== true',
      nextState: 'MAIN_introduction'
    }
  ]
},
{
  id: 'MAIN_introduction',
  logics: [
    {
      messages: [
        'Hi there, nice to meet you!',
        'My name is Cobbie, your personal assistant :)'
      ],
      responses: [
        { type: 'button', text: 'Nice to meet you too, Cobbie!'}
      ]
    },
    {
      messages: [
        'I\'m here to help you make ${state.company.name} the best place to work at!',
        'll be asking you questions regarding to your experience <br>working at P&G. But don't fret, all the information is anonymous.<br>I am fully committed to protect your privacy :)<br><br><a href="googledocslinkhere">Learn More</a>',
        'We'll use the collective feedback across the company in order to make suggestion to HR about how P&G can be improve as a whole.',
        'In addition to that, I will also provide well being-related materials personalized just for you :)'
      ]
    }
  ]
},
{
  id: 'MAIN_introduction_faq',
  logics: [
    {
      messages: [
        'What questions do you have for me? :)'
      ],
      response: [
        { type: 'button', text: 'How can we help improving P&G?', nextState: 'MAIN_introduction_faq_how-cobbie-improve-corporation' },
        { type: 'button', text: 'Nope, no more question!', action: '', nextState: 'MAIN' }
      ]
    }
  ]
},
{
  id: 'MAIN_introduction_faq_how-cobbie-improve-corporation',
  logics: [
    messages: [
      'We will help ${state.company.name} become a better place through sharing personal experience working there',
      'I will gather the experiences of all the employees throughout ${state.company.name}',
      'All of these data that I gather anonymously, will then be collected, studied, and summarized.',
      'Through the summary, I'll provide ${state.company.name} HR department with information on how ${state.company.name}
       can be improved'
    ],
    response: [
      { type: 'button', text: 'Got it!', nextState: 'MAIN_introduction_faq' }
    ]
  ]
}


FSM Notes:
clearStack: true: // By default, when there's no more logics in a state, it will go back to whatever previous state that leads to it. So if you want to clear out remembered states, set this to true