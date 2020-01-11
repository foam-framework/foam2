/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2.userFeedback',
  name: 'UserFeedbackException',
  implements: ['foam.core.Exception'],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userFeedback.UserFeedback',
      name: 'userFeedback'
    }
  ]
});
