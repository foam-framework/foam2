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
    'java.lang.Runtime'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
      ClusterConfig config = (ClusterConfig) getDelegate().find_(x, id);
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      if ( replaying != null ) {
        config = (ClusterConfig) config.fclone();
        config.setReplayingInfo(replaying);

        Runtime runtime = Runtime.getRuntime();
        config.setMemoryMax(runtime.maxMemory());
        config.setMemoryFree(runtime.freeMemory());
      }
      return config;
      `
    }
  ]
});
