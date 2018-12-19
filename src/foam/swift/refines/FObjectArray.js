/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'FObjectArraySwiftRefinement',
  refines: 'foam.core.FObjectArray',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      expression: function(of) {
        return `[${foam.lookup(of).model_.swiftName}]`
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
