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
      color: '/*%GREY1%*/ #5A5A5A',
      background: '/*%GREY5%*/ #EF0F2',
    },
    {
      name: 'UNSENT',
      label: 'Unsent',
      color: '/*%GREY1%*/ #5A5A5A',
      background: '/*%GREY5%*/ #EF0F2',
    },
    {
      name: 'SENT',
      label: 'Sent',
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED',
    },
    {
      name: 'FAILED',
      label: 'Failed',
      color: '/*%DESTRUCTIVE2%*/ #A61414',
      background: '/*%DESTRUCTIVE5%*/ #FFE9E7',
    },
    {
      name: 'BOUNCED',
      label: 'Bounced',
      color: '/*%WARNING2%*/ #D57D11',
      background: '/*%WARNING5%*/ #FFF4DE',
    },
    {
      name: 'RECEIVED',
      label: 'Received',
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED',
    }
  ]
});
