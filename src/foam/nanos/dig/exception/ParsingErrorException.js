/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'ParsingErrorException',
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
      value: '1003'
    },
    {
      class: 'String',
      name: 'type',
      value: 'Parse'
    }
  ]
})
