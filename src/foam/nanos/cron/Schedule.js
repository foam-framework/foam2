/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.cron',
  name: 'Schedule',

  documentation: `
    Schedule models a time-based trigger;
    for example: the schedule for a periodic task.
  `,

  methods: [
    {
      name: 'getNextScheduledTime',
      args: [
        {
          name: 'from',
          type: 'java.util.Date',
          documentation: `
            Date to calculate next scheduled time from.
            This is typically the current date and time.
          `
        }
      ],
      type: 'DateTime'
    }
  ]
});
