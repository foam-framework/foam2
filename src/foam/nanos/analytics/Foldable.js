/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.analytics',
  name: 'Foldable',
  methods: [
    {
      name: 'doFolds',
      args: [
        {
          type: 'foam.nanos.analytics.FoldManager',
          name: 'fm'
        }
      ]
    }
  ]
});