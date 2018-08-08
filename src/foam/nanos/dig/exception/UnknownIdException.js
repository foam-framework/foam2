/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'UnknownIdException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '400'
    },
    {
      class: 'String',
      name: 'code',
      value: '1005'
    },
    {
      class: 'String',
      name: 'type',
      value: 'NotFound'
    },
    {
      class: 'String',
      name: 'message',
      value: 'Unknown ID'
    }
  ]
})
