/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2.userfeedback',
  name: 'UserFeedbackException',

  implements: ['foam.core.Exception'],

  javaExtends: [
    'java.lang.RuntimeException'
  ],

  documentation: `
    In cases where the object is not returned to client user after a request,
    a UserFeedbackException will be thrown which will chain the message at the time
    of the exception to the other feedback messages the object has collected on its
    path to the DAO
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback'
    }
  ]
});
