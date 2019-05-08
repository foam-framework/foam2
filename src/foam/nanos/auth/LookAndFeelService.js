/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LookAndFeelService',

  methods: [
    {
      name: 'getLookAndFeel',
      async: true,
      type: 'foam.nanos.auth.LookAndFeel',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'appName',
          type: 'String'
        }
      ]
    }
  ]
});
