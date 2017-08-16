/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.export',
  name: 'ExportDriver',

  documentation: 'Interface for exporting data from a DAO',

  methods: [
    {
      name: 'exportDAO',
      returns: 'Promise',
      args: ['X', 'dao']
    }
  ]
});
