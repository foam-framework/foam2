/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.csv',
  name: 'CSVOutputterInterface',

  methods: [
    {
      name: 'outputValue',
      type: 'Void',
      args: [
        { name: 'value' }
      ]
    }
  ]
});
