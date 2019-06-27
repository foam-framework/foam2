/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'DAOReduceManager',
  javaImports: [
    'java.util.Date',
    'foam.nanos.analytics.Candlestick',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'sourceDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'destDAO'
    },
    {
      class: 'Long',
      name: 'periodLengthMs',
      documentation: 'Convenience property for setting closeTimeExpr',
      javaSetter: `
setCloseTimeExpr(new foam.glang.EndOfTimeSpan.Builder(getX())
  .setDelegate(new foam.mlang.IdentityExpr.Builder(getX()).build())
  .setTimeSpanMs(val)
  .build());
      `
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'closeTimeExpr'
    }
  ],
  methods: [
    {
      name: 'doReduce',
      synchronized: true,
      javaCode: `
foam.core.X x = getX();

foam.mlang.sink.Max lastReduceSink = (foam.mlang.sink.Max) getDestDAO()
  .select(MAX(Candlestick.OPEN_VALUE_TIME));
Date lastReduce = (Date) lastReduceSink.getValue();

foam.mlang.sink.GroupBy dataToReduce = (foam.mlang.sink.GroupBy) getSourceDAO()
  .where(GTE(Candlestick.OPEN_VALUE_TIME, lastReduce))
  .select(GROUP_BY(Candlestick.KEY, new foam.dao.ArraySink.Builder(x).build()));

for ( Object key : dataToReduce.getGroups().keySet() ) {
  java.util.Map<Date, Candlestick> reducedData = new java.util.HashMap<>();
  for ( Object o : ((foam.dao.ArraySink) dataToReduce.getGroups().get(key)).getArray() ) {
    Candlestick c = (Candlestick) o;
    Date rCloseTime = (Date) getCloseTimeExpr().f(c.getCloseTime());
    if ( ! reducedData.containsKey(rCloseTime) ) {
      reducedData.put(rCloseTime, new Candlestick.Builder(x)
        .setCloseTime(rCloseTime)
        .setKey(key)
        .build());
    }
    reducedData.get(rCloseTime).reduce(c);
  }
  for ( Candlestick c : reducedData.values() ) {
    getDestDAO().put(c);
  }
}
      `
    }
  ]
});
