/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'NullPMLogger',

  implements: [
    'foam.nanos.pm.PMLogger'
  ],

  methods: [
    {
      name: 'log',
      args: [
        {
          name: 'pm',
          type: 'PM'
        }
      ],
      javaCode: `
      // nop
      `
    }
  ]
});
