/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'FObjectCSVOutputterDecorator',

  implements: [
    'foam.lib.csv.CSVOutputterInterface'
  ],

  properties: [
    {
      name: 'outputter',
      class: 'FObjectProperty',
      of: 'foam.lib.csv.CSVOutputterInterface'
    },
    {
      name: 'preLabelString',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'outputValue',
      args: [
        { name: 'value' }
      ],
      code: function(value) {
        outputter.outputValue(preLabelString + value);
      },
      javaCode: `
        getOutputter().outputValue(getPreLabelString() + value);
      `
    }
  ]
});
