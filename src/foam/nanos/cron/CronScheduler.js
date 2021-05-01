/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronScheduler',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.NanoService'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAwareSupport',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.dao.AbstractDAO',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.MapDAO',
    'foam.mlang.MLang',
    'foam.mlang.sink.Min',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.NanoService',
    'foam.nanos.script.ScriptStatus',
    'foam.nanos.pm.PM',
    'java.util.Date',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'cronDelay',
      class: 'Long',
      value: 5000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 60000
    },
    {
      name: 'cronDAO',
      class: 'foam.dao.DAOProperty',
      visibility: 'HIDDEN',
      javaFactory: `
      return (DAO) getX().get("cronDAO");
      `
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      Timer timer = new Timer(this.getClass().getSimpleName());
      setTimer(timer);
      timer.schedule(
        new AgencyTimerTask(getX(), this),
        getInitialTimerDelay());
      `
    },
    {
      documentation: 'Get the minimum scheduled cron job',
      name: 'getMinScheduledTime',
      type: 'DateTime',
      javaCode: `
    Min min = (Min) getCronDAO()
      .where(MLang.EQ(Cron.ENABLED, true))
      .select(MLang.MIN(Cron.SCHEDULED_TIME));

    if ( min.getValue().equals(0) ) {
      return null;
    }

    return (Date) min.getValue();
      `
    },
    {
      name: 'execute',
      javaCode: `
    Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, (Logger) x.get("logger"));
    logger.info("execute");

    try {
      while ( true ) {
        foam.nanos.medusa.ClusterConfigSupport support = (foam.nanos.medusa.ClusterConfigSupport) x.get("clusterConfigSupport");
        if ( getEnabled() ) {
          Date now = new Date();

          getCronDAO().where(
                         MLang.AND(
                                   MLang.LTE(Cron.SCHEDULED_TIME, now),
                                   MLang.EQ(Cron.ENABLED, true),
                                   MLang.IN(Cron.STATUS, new ScriptStatus[] {
                                                          ScriptStatus.UNSCHEDULED,
                                                          ScriptStatus.ERROR,
                                     })
                                   )
                         )
            .orderBy(Cron.SCHEDULED_TIME)
            .select(new AbstractSink() {
                             @Override
                             public void put(Object obj, Detachable sub) {
                               Cron cron = (Cron) ((FObject) obj).fclone();
                               PM pm = new PM(this.getClass().getSimpleName(), "cronjob", cron.getId());
                               try {
                                 if ( ! cron.getClusterable() ||
                                      support == null ||
                                      support.cronEnabled(x) ) {
                                   cron.setStatus(ScriptStatus.SCHEDULED);
                                   getCronDAO().put(cron);
                                 }
                               } catch (Throwable t) {
                                 logger.error(this.getClass(), "Error scheduling cron job", cron.getId(), t.getMessage(), t);
                                 pm.error(x, t);
                               } finally {
                                 pm.log(x);
                               }
                             }
                           });
        }
        // Check for new cronjobs every 5 seconds if no current jobs
        // or if their next scheduled execution time is > 5s away
        // Delay at least a little bit to avoid blocking in case of a script error.
        long delay = getCronDelay();
        Date minScheduledTime = getMinScheduledTime();
        if( minScheduledTime != null &&
            getEnabled() ) {
          delay = Math.abs(minScheduledTime.getTime() - System.currentTimeMillis());
          delay = Math.min(getCronDelay(), delay);
          delay = Math.max(500, delay);
        }
        Thread.sleep(delay);
      }
    } catch (Throwable t) {
      logger.error(this.getClass(), t.getMessage());
      ((DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm.Builder(x)
        .setName(this.getClass().getSimpleName())
        .setSeverity(foam.log.LogLevel.ERROR)
        .setNote(t.getMessage())
        .build());
    }
    `
    }
  ]
});
