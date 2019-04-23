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
      name: 'periodLengthMs'
    }
  ],
  methods: [
    {
      name: 'doReduce',
      javaCode: `
foam.core.X x = getX();
long periodMs = getPeriodLengthMs();

foam.mlang.sink.Max lastReduceSink = (foam.mlang.sink.Max) getDestDAO()
  .select(MAX(Candlestick.OPEN_TIME));
Date lastReduce = (Date) lastReduceSink.getValue();

foam.mlang.sink.GroupBy dataToReduce = (foam.mlang.sink.GroupBy) getSourceDAO()
  .where(GTE(Candlestick.OPEN_TIME, lastReduce))
  .select(GROUP_BY(Candlestick.KEY, new foam.dao.ArraySink.Builder(x).build()));

for ( Object key : dataToReduce.getGroups().keySet() ) {
  java.util.Map<Long, Candlestick> reducedData = new java.util.HashMap<Long, Candlestick>();
  for ( Object o : ((foam.dao.ArraySink) dataToReduce.getGroups().get(key)).getArray() ) {
    Candlestick c = (Candlestick) o;
    long cCloseTimeMs = c.getCloseTime().getTime();
    long rCloseTimeMs = cCloseTimeMs - ( cCloseTimeMs % periodMs ) + periodMs;
    if ( ! reducedData.containsKey(rCloseTimeMs) ) {
      reducedData.put(rCloseTimeMs, new Candlestick.Builder(x)
        .setOpenTime(new Date(rCloseTimeMs - periodMs))
        .setCloseTime(new Date(rCloseTimeMs))
        .setKey(key)
        .build());
    }
    reducedData.get(rCloseTimeMs).reduce(c);
  }
  for ( Candlestick c : reducedData.values() ) {
    getDestDAO().put(c);
  }
}
      `
    }
  ]
});