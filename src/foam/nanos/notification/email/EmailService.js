/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.email',
  name: 'EmailService',

  methods: [
    {
      name: 'sendEmail',
      async: true,
      type: 'foam.nanos.notification.email.EmailMessage',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage'
        }
      ]
    }
  ]
});
