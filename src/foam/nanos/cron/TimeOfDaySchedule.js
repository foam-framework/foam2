/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.datetime',
  name: 'TimeOfDaySchedule',

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
      name: 'time'
    }
  ],

  methods: [
    {
      name: 'getNextScheduledTime',
      type: 'DateTime',
      javaCode:
`
Calendar now = Calendar.getInstance();
Calendar nextTOD = Calendar.getInstance();

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
