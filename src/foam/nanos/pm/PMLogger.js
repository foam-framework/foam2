/**
 * @License
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.pm',
  name: 'PMLogger',

  methods: [
    {
      name: 'log',
      args: [
        {
          name: 'pm',
          type: 'PM'
        }
      ]
    }
  ]
});
