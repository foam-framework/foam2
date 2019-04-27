/**
 * @License
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.om',
  name: 'OMLogger',

  methods: [
    {
      name: 'log',
      type: 'Void',
      args: [
        {
          name: 'om',
          type: 'foam.nanos.om.OM'
        }
      ]
    }
  ]
});
