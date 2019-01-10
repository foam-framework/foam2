/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib',
  name: 'Outputter',

  javaExtends: [
    'java.io.Closeable',
    'java.io.Flushable'
  ],

  methods: [
    {
      name: 'close',
      javaThrows: [ 'java.io.IOException' ]
    },
    {
      name: 'flush',
      javaThrows: [ 'java.io.IOException' ]
    },
    {
      name: 'stringify',
      type: 'String',
      args: [
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'output',
      type: 'Void',
      args: [
        {
          name: 'value',
          type: 'Any'
        }
      ]
    }
  ]
});
