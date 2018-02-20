/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.logger',
  name: 'Logger',

  methods: [
    { name: 'log',   documentation: 'Synonym for info.'      , javaReturns: 'void', args: [ { name: 'args', javaType: 'Object...' } ] },
    { name: 'info',  documentation: 'Log at info log level.' , javaReturns: 'void', args: [ { name: 'args', javaType: 'Object...' } ] },
    // TODO: rename to warn
    { name: 'warning',  documentation: 'Log at warn log level.' , javaReturns: 'void', args: [ { name: 'args', javaType: 'Object...' } ] },
    { name: 'error', documentation: 'Log at error log level.', javaReturns: 'void', args: [ { name: 'args', javaType: 'Object...' } ] },
    { name: 'debug', documentation: 'Log at debug log level.', javaReturns: 'void', args: [ { name: 'args', javaType: 'Object...' } ] }
  ]
});
