/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigMonitor',

  implements: [
    'foam.core.ContextAgent',
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.NOT'
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "execute");
      DAO dao = (DAO) x.get("localClusterConfigDAO");
      dao = dao.where(
       AND(
          EQ(ClusterConfig.ENABLED, true),
          NOT(EQ(ClusterConfig.ID, System.getProperty("hostname", "localhost")))
        )
      );
      dao.select(new ClusterConfigPingSink(x, dao));
   `
    }
  ]
});
