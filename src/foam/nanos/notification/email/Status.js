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
      label: 'Unknown',
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    },
    {
      name: 'UNSENT',
      label: 'Unsent',
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'SENT',
      label: 'Sent',
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    {
      name: 'FAILED',
      label: 'Failed',
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f',
    },
    {
      name: 'BOUNCED',
      label: 'Bounced',
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f',
    },
    {
      name: 'RECEIVED',
      label: 'Received',
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    }
  ]
});
