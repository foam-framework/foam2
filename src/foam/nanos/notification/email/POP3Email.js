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
      javaReturns: 'void',
      returns: 'Promise'
    },
    {
      name: 'sendEmail',
      javaReturns: 'String',
      returns: 'Promise',  
      args: [
        {
          class:'String',
          name:'requestor'
        },
        {
          class:'String',
          name:'subject'
        },
        {
          class:'String',
          name:'body'
        }
      ]
    }
  ]
});