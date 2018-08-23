/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos',
  name: 'NanoService',

  methods: [
    {
      name: 'start',
      javaReturns: 'void',
      javaThrows: [
        'java.lang.Exception'
      ]
    }
  ]
});
