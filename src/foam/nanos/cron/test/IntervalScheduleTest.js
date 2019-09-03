/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron.test',
  name: 'IntervalScheduleTest',
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

      Calendar next = Calendar.getInstance();

      Schedule testInterval = new IntervalSchedule.Builder(x)
        .setStart(now.getTime())
        .setDuration(new TimeHMS.Builder(x)
          .setHour(0).setMinute(0)
          .setSecond(3)
          .build())
        .build();

      // TEST: start time should be the first scheduled time
      next.setTime(testInterval.getNextScheduledTime(now.getTime()));
      test(now.getTime().equals(next.getTime()),
        "First scheduled time for IntervalSchedule is start time"
      );

      // TEST: next time should be 3 seconds later
      now.add(Calendar.SECOND, 1);
      next.setTime(testInterval.getNextScheduledTime(now.getTime()));
      now.add(Calendar.SECOND, 2);
      test(now.getTime().equals(next.getTime()),
        "Next interval minus duration equals current time"
      );

      // TEST: it should work tomorrow
      now.add(Calendar.DATE, 1);
      next.setTime(testInterval.getNextScheduledTime(now.getTime()));
      test(now.getTime().equals(next.getTime()),
        "Next interval minus duration equals current time"
      );
      `
    }
  ]
});