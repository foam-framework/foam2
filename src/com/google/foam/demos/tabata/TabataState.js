/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  name: 'TabataState',
  methods: [
    {
      name: 'start',
      args: [
        {
          name: 't',
          swiftType: 'Tabata',
        },
      ],
    },
    {
      name: 'next',
      args: [
        {
          name: 't',
          swiftType: 'Tabata',
        },
      ],
    },
  ]
});
