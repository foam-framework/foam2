/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.INTERFACE({
  package: 'foam.nanos.notification',
  name: 'ResendNotificationServiceInterface',

  documentation: `
  A nanoService for resend notification for a specific user base on the notification.`,

    methods: [
      {
        name: 'resend',
        async: true,
        type: 'void',
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'userId',
            type: 'Long'
          },
          {
            name: 'notification',
            type: 'foam.nanos.notification.Notification'
          }
        ]
      }
    ]
});
