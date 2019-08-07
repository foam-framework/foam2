/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.csv',
  name: 'CSVOutputter',

  properties: [
    {
      class: 'Boolean',
      name: 'isFirstRow'
    }
  ],

  methods: [
    {
      name: 'outputValue',
      args: [
        { name: 'value' }
      ]
    },
    {
      name: 'outputHeader',
      args: [
        { type: 'Context', name: 'x' }
      ]
    },
    {
      name: 'outputFObject',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'FObject', name: 'obj' }
      ]
    },
    {
      name: 'flush'
    }
  ]
});
