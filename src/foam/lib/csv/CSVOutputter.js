/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.csv',
  name: 'CSVOutputter',

  methods: [
    {
      name: 'outputValue',
      args: [
        { name: 'value' }
      ]
    },
    {
      name: 'outputFObject',
      args: [
        { type: 'FObject', name: 'obj' }
      ]
    },
    {
      name: 'flush'
    }
  ]
});
