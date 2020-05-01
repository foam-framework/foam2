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
    'java.util.Date'
  ],

  documentation: 'FOAM class that models a Cron script',

  tableColumns: [
    'id', 'enabled', 'description', 'lastDuration', 'status', 'scheduledTime', 'run'
  ],

  searchColumns: ['id', 'description'],

  sections: [
    {
      name: 'scheduling',
      isAvailable: function(id) { return !! id; },
      order: 2
    },
    {
      name: '_defaultSection',
      order: 1
    }
  ],

  properties: [
    {
      name: 'server',
      hidden: true,
      value: true
    },
    {
      name: 'schedule',
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.Schedule',
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
      documentation: 'Scheduled time to run Cron script.',
      section: 'scheduling',
      visibility: 'RO',
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
`/*
  I don't know why we're doing this because we aren't specifying a user or
  group to be notified and we aren't including the script output either.
  Also, if we were to notify, we should use a ScriptRunNotification rather
  than a generic notification. Maybe there should be properties to say which
  users or groups to notify, or if notifications should be sent or not (and
  their expiry).
Notification cronStartNotify = new Notification();
cronStartNotify.setBody("Cron STARTED - " + this.getId() + " " + this.getDescription());
notification.put(cronStartNotify);
*/
super.runScript(x);

/*
Notification cronEndNotify = new Notification();
cronEndNotify.setBody("Cron ENDED - " + this.getId() + " " + this.getDescription());
notification.put(cronEndNotify);
*/

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
