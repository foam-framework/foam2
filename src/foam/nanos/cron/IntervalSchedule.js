/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'IntervalSchedule',

  documentation: `
    Schedule periodically with a time duration (hours, minutes, seconds).

    For example, to run a task every 90 minutes:
    { start: "1970-01-01",
      duration: { hour: 1, minute: 30 , second: 0 } }
  `,

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  javaImports: [
    'java.util.Calendar',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.TimeHMS',
      name: 'duration',
      factory: () => {
        return foam.nanos.cron.TimeHMS.create();
      }
    },
    {
      class: 'DateTime',
      name: 'start'
    }
  ],

  methods: [
    {
      name: 'getNextScheduledTime',
      type: 'DateTime',
      args: [
        {
          name: 'from',
          type: 'java.util.Date'
        }
      ],
      javaCode:
`
Calendar now = Calendar.getInstance();
now.setTime(from);

Calendar start = Calendar.getInstance();
start.setTime(getStart());
if ( now.getTimeInMillis() < start.getTimeInMillis() ) {
  return start.getTime();
}

Calendar next = Calendar.getInstance();
next.setTime(getStart());
while ( next.getTimeInMillis() < now.getTimeInMillis() ) {
  next.add(Calendar.HOUR_OF_DAY, getDuration().getHour());
  next.add(Calendar.MINUTE,      getDuration().getMinute());
  next.add(Calendar.SECOND,      getDuration().getSecond());
}

return next.getTime();
`
    }
  ]
});

