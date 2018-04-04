/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.mlang.predicate.AbstractPredicate',
  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          swiftType: 'Any?'
        }
      ],
      swiftCode: 'return false',
      swiftReturns: 'Bool'

    }
  ],
});
