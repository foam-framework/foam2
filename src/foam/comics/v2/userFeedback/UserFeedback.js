/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2.userFeedback',
  name: 'UserFeedback',

  properties: [
    {
      class: 'Enum',
      name: 'status',
      of: 'foam.comics.v2.userFeedback.UserFeedbackStatus'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userFeedback.UserFeedback',
      name: 'delegate'
    }
  ],
});
