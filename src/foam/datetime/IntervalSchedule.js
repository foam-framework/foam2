foam.CLASS({
  package: 'foam.datetime',
  name: 'IntervalSchedule',
  implements: [
    'foam.datetime.Schedule'
  ],

  javaImports: [
    'java.util.Date',
    'java.util.Calendar'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.datetime.TimeHMS',
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
      javaCode:
`
Calendar now = Calendar.getInstance();

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

