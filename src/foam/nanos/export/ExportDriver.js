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
      name: 'exportFObject',
      type: 'String',
      args: ['X', 'obj'],
      documentation: 'Exports an FObject',
      flags: ['js']
    },
    {
      name: 'exportDAO',
      type: 'Promise',
      args: ['X', 'dao'],
      documentation: 'Exports data in a DAO',
      flags: ['js']
    },
    {
      name: 'tearDown',
      type: 'String',
      args: ['X', 'obj'],
      flags: ['js']
    }
  ]
});