/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.FObjectArray',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      expression: function(of) {
        return `[${foam.lookup(of || 'foam.core.FObject').model_.swiftName}]`
      },
    },
    {
      name: 'swiftValue',
      expression: function(value) {
        return '[]'
      },
    },
  ],
});
