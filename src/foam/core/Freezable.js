/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'Freezable',

  methods: [
    {
      name: 'beforeFreeze',
      returns: 'Promise',
      javaReturns: 'void',
      swiftReturns: 'Void'
    },
    {
      name: 'freeze',
      returns: 'Promise',
      javaReturns: 'void',
      swiftReturns: 'Void'
    },
    {
      name: 'isFrozen',
      returns: 'Boolean',
      javaReturns: 'boolean',
      swiftReturns: 'Bool'
    }
  ]
});
