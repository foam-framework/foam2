/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'OrSchedule',

  documentation: `
    Schedule to pick the nearest time from a number of delegate schedules.
  `,

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      name: 'delegates',
      class: 'FObjectArray',
      of: 'foam.nanos.cron.Schedule',
      view: () => {
        return {
          class: 'foam.u2.view.FObjectArrayView',
          of: 'foam.nanos.cron.Schedule',
          defaultNewItem: foam.nanos.cron.IntervalSchedule.create({
            start: "2019-10-14",
            duration: foam.nanos.cron.TimeHMS.create({
              hour: 0, minute: 0, second: 0
            })
          })
        };
      }
    }
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
      javaCode: `
        Date min = null;
        for ( Schedule sched : getDelegates() ) {
          Date next = sched.getNextScheduledTime(from);
          if ( min == null ) {
            min = sched.getNextScheduledTime(from);
          } else if ( next.getTime() < min.getTime() ) {
            min = next;
          }
        }
        return min;
      `
    }
  ]
});
