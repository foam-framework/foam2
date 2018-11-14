/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'NullEmailService',
  implements: [
    'foam.nanos.notification.email.EmailService'
  ],
  methods: [
    {
      name: 'sendEmail',
      javaCode: '// NOOP',
      code: function() { return Promise.resolve(); }
    },
    {
      name: 'sendEmailFromTemplate',
      javaCode: '// NOOP',
      code: function() { return Promise.resolve(); }
    }
  ]
});
