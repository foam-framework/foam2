/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2.userfeedback',
  name: 'UserFeedback',

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
      name: 'delegate'
    }
  ],
});
