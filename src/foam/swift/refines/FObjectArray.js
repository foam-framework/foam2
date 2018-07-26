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
        return '[' + (of ? foam.lookup(of).model_.swiftName : 'FObject') + ']'
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
