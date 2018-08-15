/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DAONotFoundException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '404'
    },
    {
      class: 'String',
      name: 'code',
      value: '1000'
    },
    {
      class: 'String',
      name: 'type',
      value: 'NotFound'
    }
  ]
})
