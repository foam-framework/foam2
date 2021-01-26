/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayNodeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Response to ReplayCmd on Node`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Journal',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  properties: [
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
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
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayDetailsCmd ) {
        ReplayDetailsCmd details = (ReplayDetailsCmd) obj;

        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");

        details.setMinIndex(info.getMinIndex());
        details.setMaxIndex(info.getMaxIndex());
        details.setCount(info.getCount());

        getLogger().info("ReplayDetailsCmd", "requester", details.getRequester(), "min", details.getMinIndex(), "count", details.getCount());
        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        ReplayCmd cmd = (ReplayCmd) obj;
        getLogger().info("ReplayCmd", "requester", cmd.getDetails().getRequester(), "min", cmd.getDetails().getMinIndex());

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig fromConfig = support.getConfig(x, cmd.getDetails().getResponder());
        ClusterConfig toConfig = support.getConfig(x, cmd.getDetails().getRequester());
        DAO clientDAO = support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig);

        getJournal().replay(x, new RetryClientSinkDAO(x, clientDAO));
        return cmd;
      }

      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'select_',
      javaCode: `
        DAO tempMDAO = new MDAO(getOf());
        getJournal().replay(x, tempMDAO);

        Sink tempSink = new ArraySink();
        tempMDAO.select_(x, tempSink, skip, limit, order, predicate);
        List array = ((ArraySink)tempSink).getArray();

        for ( Object o: array ) {
          sink.put(o, null);
        }
        
        return sink;
      `
    }
  ]
});
