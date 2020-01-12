/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.comics.v2.userfeedback',
  name: 'UserFeedbackStatus',
  documentation: `
    Functional statuses which highlight different types of feedback
    the client user is interested in
  `,

  values: [
    { name: 'SUCCESS',   label: 'Success' },
    { name: 'INFO',  label: 'Info' },
    { name: 'ERROR',  label: 'Error' }
  ]
});
