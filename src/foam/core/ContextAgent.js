/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'ContextAgent',

  methods: [
    {
      name: 'execute',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ]
    }
  ]
});