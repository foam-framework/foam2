/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron.test',
  name: 'TimeOfDayScheduleTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.cron.*',
    'java.util.Date',
    'java.util.Calendar'
  ],

  methods: [
    {
      name: 'runTest',

      javaCode: `
      Calendar now  = Calendar.getInstance();
      now.set(Calendar.MILLISECOND, 0);
      now.set(Calendar.YEAR, 2019);
      now.set(Calendar.MONTH, 1);
      now.set(Calendar.DAY_OF_MONTH, 1);
      now.set(Calendar.HOUR_OF_DAY, 0);
      now.set(Calendar.MINUTE, 0);
      now.set(Calendar.SECOND, 0);

      Calendar next = Calendar.getInstance();

      // Create schedule for 1:02:03 PM
      Schedule testTOD = new TimeOfDaySchedule.Builder(x)
        .setTime(new TimeHMS.Builder(x)
          .setHour(13).setMinute(2)
          .setSecond(3)
          .build())
        .build();

      // TEST: next time should be current day at 1:02:03 PM
      next.setTime(testTOD.getNextScheduledTime(now.getTime()));
      now.add(Calendar.HOUR_OF_DAY, 13);
      now.add(Calendar.MINUTE, 2);
      now.add(Calendar.SECOND, 3);
      test(now.getTime().equals(next.getTime()),
        "TimeOfDaySchedule works at midnight" + 
        ":" + now.getTime().toString() +
        ":" + next.getTime().toString()
      );

      // TEST: at 2:02:03 PM the scheduled time should be tomorrow
      now.add(Calendar.HOUR_OF_DAY, 1);
      next.setTime(testTOD.getNextScheduledTime(now.getTime()));

      now.set(Calendar.HOUR_OF_DAY, 13);
      now.add(Calendar.DATE, 1);
      test(now.getTime().equals(next.getTime()),
        "TimeOfDaySchedule works after scheduled time" + 
        ":" + now.getTime().toString() +
        ":" + next.getTime().toString()
      );
      `
    }
  ]
});
