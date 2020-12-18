/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.test',
  name: 'RuledDummy',
  extends: 'foam.nanos.ruler.Ruled',

  documentation: 'Dummy model for RuledDAOTest',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'prop'
    }
  ]
})
