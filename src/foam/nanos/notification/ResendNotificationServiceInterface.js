/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
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
