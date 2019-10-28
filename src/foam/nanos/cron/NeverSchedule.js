/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'NeverSchedule',
  documentation: `
    Schedule that always reports the date corresponding to the
    timestamp represented by the maximum long integer.
  `,
  implements: [
    'foam.nanos.cron.Schedule'
  ],
  methods: [
    {
      name: 'getNextScheduledTime',
      args: [
        {
          name: 'from',
          type: 'java.util.Date'
        }
      ],
      javaCode: `return new java.util.Date(Long.MAX_VALUE);`
    }
  ]
});