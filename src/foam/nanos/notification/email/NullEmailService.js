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
      javaCode: 'return null;',
      code: function() { return null; }
    },
    {
      name: 'start',
      javaCode: '//NOOP',
      code: function() { return; }
    }
  ]
});
