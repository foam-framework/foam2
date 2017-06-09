/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.oao',
  name: 'OAO',

  documentation: 'OAO Interface',

  methods: [
    {
      name: 'get',
      returns: 'Promise',
      args: [ 'x' ]
    },
    {
      name: 'setProperty',
      returns: '',
      args: [ 'x', 'name', 'value' ]
    },
    {
      name: 'setProperties',
      returns: '',
      args: [ 'x', 'values' ]
    }
  ]
});
