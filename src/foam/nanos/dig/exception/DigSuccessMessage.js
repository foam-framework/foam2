/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DigSuccessMessage',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '200'
    },
    {
      class: 'String',
      name: 'code',
      value: '1006'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'String',
      name: 'type',
      value: 'Success'
    }
  ]
})
