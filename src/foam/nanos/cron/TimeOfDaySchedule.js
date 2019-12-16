/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'TimeOfDaySchedule',

  documentation: `
    Schedule every day at a specific time.

    For example, to run a task at midnight:
    { time: { hour: 0, minute: 0, second: 0 } }
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
      name: 'time',
      factory: () => {
        return foam.nanos.cron.TimeHMS.create();
      }
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
Calendar nextTOD = Calendar.getInstance();
nextTOD.setTime(from);

// Zero milliseconds
nextTOD.set(Calendar.MILLISECOND, 0);

// Set time for next run
nextTOD.set(Calendar.HOUR_OF_DAY, getTime().getHour());
nextTOD.set(Calendar.MINUTE,      getTime().getMinute());
nextTOD.set(Calendar.SECOND,      getTime().getSecond());

// Increment the date if time now is after scheduled time of day
if ( nextTOD.getTimeInMillis() < now.getTimeInMillis() ) {
  nextTOD.add(Calendar.DATE, 1);
}

return nextTOD.getTime();
`
    }
  ]
});
