/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2.userfeedback',
  name: 'UserFeedback',
  documentation: `
    A model track of feedback messages as an object travels 
    through multiple decorators on the back-end and 
    inevitably making its way back to the client who views the feedback
  `,

  properties: [
    {
      class: 'Enum',
      name: 'status',
      of: 'foam.comics.v2.userfeedback.UserFeedbackStatus'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'next',
      javaToCSV: ``,
      javaToCSVLabel: ``
    }
  ],
});
