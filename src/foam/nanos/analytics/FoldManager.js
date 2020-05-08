/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.analytics',
  name: 'FoldManager',
  methods: [
    {
      name: 'foldForState',
      args: [
        {
          type: 'Object',
          name: 'key'
        },
        {
          type: 'DateTime',
          name: 'time'
        },
        {
          type: 'Float',
          name: 'value'
        }
      ]
    }
  ]
});
