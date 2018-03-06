/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.support.model',
    name: 'Ticket',
    documentation: 'First Ticket Modal',
    properties: [
      {
        class: 'Long',
        name: 'id'
      }, 
      {
        class: 'Long',
        name: 'requestorId'
      },
      {
        class: 'String',
        name: 'supportEmail'
      },
      {
        class: 'String',
        name: 'subject'
      },
      {
        class: 'String',
        name: 'publicMessage'
      },
      {
        class: 'DateTime',
        name: 'time'
        
      },
      {
        class: 'DateTime',
        name: 'createdAt'
      },
      {
        class: 'String',
        name: 'internalNote'
      },
      {
        class: 'String',
        name: 'status'
      }
    ],
  
    methods: [
     
    ]
  });
  
  
  