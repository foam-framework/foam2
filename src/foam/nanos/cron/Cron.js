/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'Cron',
  extends: 'foam.nanos.script.Script',

  imports: [ 'cronDAO as scriptDAO' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.util.Date'
  ],

  documentation: 'FOAM class that models a Cron script',

  tableColumns: [
    'id', 'enabled', 'server', 'description', 'lastDuration', 'status', 'run'
  ],

  searchColumns: ['id', 'description'],

  sections: [
    {
      name: 'scheduling',
      order: 2
    },
    {
      name: '_defaultSection',
      order: 1
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.Schedule',
      name: 'schedule',
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.nanos.cron.Schedule'
      },
      section: 'scheduling',
      javaFactory: `return new CronSchedule.Builder(getX()).build();`
    },
    {
      class: 'DateTime',
      name: 'scheduledTime',
      documentation: `Scheduled time to run Cron script.`,
      hidden: true,
      javaFactory: 'return getNextScheduledTime();'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: false
    }
  ],

  methods: [
    {
      name: 'runScript',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Void',
      javaCode:
`DAO notification = (DAO) x.get("notificationDAO");

Notification cronStartNotify = new Notification();
cronStartNotify.setBody("Cron STARTED - " + this.getId() + " " + this.getDescription());
notification.put(cronStartNotify);

super.runScript(x);

Notification cronEndNotify = new Notification();
cronEndNotify.setBody("Cron ENDED - " + this.getId() + " " + this.getDescription());
notification.put(cronEndNotify);

setScheduledTime(getNextScheduledTime());`
    },
    {
      name: 'getNextScheduledTime',
      type: 'Date',
      javaCode:
`
return getSchedule().getNextScheduledTime(
  new Date(System.currentTimeMillis())
);
`
    }
  ]
});
