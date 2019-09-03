/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.cron',
  name: 'Schedule',
  abstract: true,

  documentation: `
    Schedule for tasks which have a start time and no specified end time.
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
