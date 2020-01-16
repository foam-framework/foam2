/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.comics.v2.userfeedback',
  name: 'UserFeedbackAware',
  documentation: `
    A temporary solution to storing UserFeedback until we figure out a way
    to directly add it to FObject
  `,

  methods: [
    {
      name: 'getUserFeedback',
      type: 'foam.comics.v2.userfeedback.UserFeedback',
    },
    {
      name: 'setUserFeedback',
      args: [
        {
          name: 'userFeedback',
          type: 'foam.comics.v2.userfeedback.UserFeedback',
        }
      ]
    }
  ]
});
