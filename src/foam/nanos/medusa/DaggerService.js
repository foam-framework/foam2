/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'DaggerService',

  methods: [
    {
      name: 'getNextLinks',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.medusa.DaggerLinks'
    },
    {
      name: 'updateLinks',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'link',
          type: 'foam.nanos.medusa.DaggerLink'
        }
      ]
    }
  ]
});
