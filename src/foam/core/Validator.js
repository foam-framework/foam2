/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'Validator',
  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaThrows: [ 'IllegalStateException' ],
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ]
    }
  ]
})
