/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'Cron',
  extends: 'foam.nanos.script.Script',

  imports: [
    'cronDAO',
    'cronEventDAO'
  ],

  javaImports: [
    'foam.core.ClientRuntimeException',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.nanos.script.ScriptStatus',
    'java.util.Date'
  ],

  documentation: 'FOAM class that models a Cron script',

  tableColumns: [
    'id',
    'enabled',
    'lastDuration',
    'lastRun',
    'status',
    'scheduledTime',
    'run'
  ],

  searchColumns: [
    'id',
    'description',
    'enabled',
    'status'
  ],

  sections: [
    {
      name: 'scheduling',
      isAvailable: function(id) { return !! id; },
      order: 2
    },
    {
      name: 'scriptEvents',
      title: 'Events',
      order: 3
    },
    {
      name: '_defaultSection',
      title: 'Info',
      order: 1
    }
  ],

  properties: [
    {
      documentation: 'Cron jobs shall be enabled as a deployment step.',
      class: 'Boolean',
      name: 'enabled'
    },
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
      visibility: 'RO',
      javaFactory: `return getNextScheduledTime(getX());`,
      tableWidth: 170,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'cronDAO'
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'cronEventDAO'
    }
  ],

  methods: [
    {
      name: 'canRun',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        if ( getClusterable() ) {
          foam.nanos.medusa.ClusterConfigSupport support = (foam.nanos.medusa.ClusterConfigSupport) x.get("clusterConfigSupport");
          if ( support != null &&
               ! support.cronEnabled(x) ) {
            ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "execution disabled.", getId(), getDescription());
            throw new ClientRuntimeException(this.getClass().getSimpleName() + " " + EXECUTION_DISABLED);
          }
        }
        return true;
      `
    },
    {
      name: 'getNextScheduledTime',
      args: [
        {
          name: 'x',
          type: 'X'
        }
      ],
      type: 'Date',
      javaCode:
`
return getSchedule().getNextScheduledTime(x,
  new Date(System.currentTimeMillis())
);
`
    }
  ]
});
