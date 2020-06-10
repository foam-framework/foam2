/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.notification.email',
  name: 'Status',

  documentation: `
    Status of an email message.
  `,

  properties: [
    {
      class: 'String',
      name: 'errorMessage'
    }
  ],

  values: [
    {
      name: 'UNKNOWN',
      label: 'Unknown'
    },
    {
      name: 'UNSENT',
      label: 'Unsent'
    },
    {
      name: 'SENT',
      label: 'Sent'
    },
    {
      name: 'FAILED',
      label: 'Failed'
    },
    {
      name: 'BOUNCED',
      label: 'Bounced'
    },
    {
      name: 'RECEIVED',
      label: 'Received'
    }
  ]
});
