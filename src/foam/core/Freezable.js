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
      async: true,
      returns: 'Void'
    },
    {
      name: 'freeze',
      async: true,
      returns: 'Void'
    },
    {
      name: 'isFrozen',
      async: true,
      returns: 'Boolean'
    }
  ]
});
