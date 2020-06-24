/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayingInfoDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Return ReplayingInfo for this instance`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
      ClusterConfig config = (ClusterConfig) getDelegate().find_(x, id);
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      if ( id.toString().equals(config.getId()) &&
           config.getType() == MedusaType.MEDIATOR ) {
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying != null ) {
          config = (ClusterConfig) config.fclone();
          config.setReplayingInfo(replaying);
        }
      }
      return config;
      `
    },
    // {
    //   name: 'select_',
    //   javaCode: `
    //   ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    //   ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
    //   replaying.setId(support.getConfigId());
    //   if ( sink == null ) {
    //     sink = new ArraySink();
    //   }
    //   sink.put(replaying, null);
    //   sink.eof();
    //   return sink;
    //   `
    // }
  ]
});
