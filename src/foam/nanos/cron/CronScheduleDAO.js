/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronScheduleDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Update cron scheduledTime on schedule changed',

  javaImports: [
    'foam.nanos.script.ScriptStatus',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Cron newCron = (Cron) obj;
        Cron oldCron = (Cron) getDelegate().find_(x, obj);

        if ( oldCron == null ||
             newCron.getStatus() == ScriptStatus.SCHEDULED ||
             ! SafetyUtil.equals(oldCron.getSchedule(), newCron.getSchedule())
        ) {
          newCron.setScheduledTime(newCron.getNextScheduledTime(x));
        }
        return getDelegate().put_(x, newCron);
      `
    }
  ]
});
