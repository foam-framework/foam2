/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.email',
  name: 'EmailService',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'sendEmail',
      javaReturns: 'void',
      returns: 'Promise',
      javaThrows: [
        'javax.mail.MessagingException'
      ],
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage'
        }
      ]
    },
    {
      name: 'sendEmailFromTemplate',
      javaReturns: 'void',
      returns: 'Promise',
      javaThrows: [
        'javax.mail.MessagingException'
      ],
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage'
        },
        {
          name: 'template',
          javaType: 'String'
        },
        {
          name: 'args',
          javaType: 'Object[]'
        }
      ]
    }
  ]
});