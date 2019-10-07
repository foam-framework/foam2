/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'PrefixedCSVOutputter',
  extends: 'foam.lib.csv.ProxyCSVOutputter',
  properties: [
    {
      class: 'String',
      name: 'prefix'
    }
  ],
  methods: [
    {
      name: 'outputValue',
      code: function(value) {
        this.delegate.outputValue(this.prefix + value.toString());
      },
      javaCode: `
        getDelegate().outputValue(getPrefix() + value.toString());
      `,
    }
  ]
});