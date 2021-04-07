/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PromotedPurgeAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: 'Remove promoted entries which will never be referenced again',

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.LTE',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.Timer'
  ],

  properties: [
    {
      // REVIEW: Get this from DaggerService?
      documentation: 'Presently Dagger service bootstraps two entries.',
      name: 'minIndex',
      class: 'Long',
      value: 2
    },
    {
      documentation: 'Number of entries to retain for potential consensus matching.',
      name: 'retain',
      class: 'Long',
      value: 1000,
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 5000
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 60000
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      getLogger().info("start", "interval", getTimerInterval());
      schedule(getX());
      `
    },
    {
      name: 'schedule',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
      long interval = getTimerInterval();
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      timer.schedule(
        new AgencyTimerTask(x, support.getThreadPoolName(), this),
        interval);
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      PM pm = new PM(this.getClass().getSimpleName());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");

      try {
        DAO dao = (DAO) x.get("medusaEntryDAO");
        dao = dao.where(
          AND(
            GT(MedusaEntry.INDEX, getMinIndex()),
            LTE(MedusaEntry.INDEX, replaying.getIndex() - getRetain()),
            EQ(MedusaEntry.PROMOTED, true)
          )
        );
        Count count = (Count) dao.select(COUNT());
        if ( count.getValue() > 0 ) {
          getLogger().debug("purging", count.getValue());
          dao.select(new PurgeSink(x, new foam.dao.RemoveSink(x, dao)));
        }
      } catch ( Throwable t ) {
        pm.error(x, t);
        getLogger().error(t);
      } finally {
        pm.log(x);
        schedule(x);
      }
      `
    }
  ]
});
