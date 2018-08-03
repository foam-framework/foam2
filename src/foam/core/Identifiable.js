/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'Identifiable',

  methods: [
    {
      name: 'getPrimaryKey',
      javaReturns: 'Object',
      swiftReturns: 'Any?'
    }
  ]
});
