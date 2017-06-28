/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.mop',
  name: 'MOP',

  documentation: 'MOP Interface',

  methods: [
    {
      name: 'get',
      returns: 'Promise',
      args: [ 'x' ]
    },
    {
      name: 'setProperty',
      returns: 'Promise',
      args: [ 'x', 'name', 'value' ]
    },
    {
      name: 'setProperties',
      returns: 'Promise',
      args: [ 'x', 'values' ]
    }
  ]
});
