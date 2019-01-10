/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.logger',
  name: 'Logger',

  methods: [
    {
      name: 'log',
      documentation: 'Synonym for info.',
      type: 'Void',
      // TODO: How do we capture Object... in our type system?
      args: [ { name: 'args', javaType: 'Object...' } ]
    },
    {
      name: 'info',
      documentation: 'Log at info log level.' ,
      type: 'Void',
      args: [ { name: 'args', javaType: 'Object...' } ]
    },
    // TODO: rename to warn
    {
      name: 'warning',
      documentation: 'Log at warn log level.' ,
      type: 'Void',
      args: [ { name: 'args', javaType: 'Object...' } ]
    },
    {
      name: 'error',
      documentation: 'Log at error log level.',
      type: 'Void',
      args: [ { name: 'args', javaType: 'Object...' } ]
    },
    {
      name: 'debug',
      documentation: 'Log at debug log level.',
      type: 'Void',
      args: [ { name: 'args', javaType: 'Object...' } ]
    }
  ]
});
