/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DigErrorMessage',
  implements: ['foam.core.Exception'],

  properties: [
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
     class: 'String',
     name: 'type'
    },
    {
      class: 'String',
      name: 'developerMessage'
    },
    {
      class: 'String',
      name: 'moreInfo'
    }
  ]
});
