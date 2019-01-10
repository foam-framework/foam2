/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.email',
  name: 'POP3Email',

  methods: [
    {
      name: 'start',
      async: true,
    },
    {
      name: 'sendEmail',
      type: 'String',
      async: true,
      args: [
        {
          type:'String',
          name:'requestor'
        },
        {
          type:'String',
          name:'subject'
        },
        {
          type:'String',
          name:'body'
        }
      ]
    }
  ]
});
