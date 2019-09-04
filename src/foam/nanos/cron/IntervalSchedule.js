/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'IntervalSchedule',
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
      name: 'duration'
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

