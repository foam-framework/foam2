/**ß
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'EmptyDataException',
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
      value: '1002'
    },
    {
      class: 'String',
      name: 'type',
      value: 'DAOReject'
    },
    {
      class: 'String',
      name: 'message',
      value: 'PUT|POST expecting data, non received.'
    }
  ]
})
