foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'DAOReduceManager',
  javaImports: [
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
java.util.Date lastReduce = (java.util.Date) lastReduceSink.getValue();

foam.dao.ArraySink dataToReduce = (foam.dao.ArraySink) getSourceDAO()
  .where(GTE(Candlestick.OPEN_TIME, lastReduce))
  .orderBy(Candlestick.OPEN_TIME)
  .select(new foam.dao.ArraySink.Builder(getX()).build());

getDestDAO()
  .where(GTE(Candlestick.OPEN_TIME, lastReduce))
  .removeAll();

java.util.Iterator i = dataToReduce.getArray().iterator();
while(i.hasNext()) {
  Candlestick c = (Candlestick) i.next();
  long cCloseTimeMs = c.getCloseTime().getTime();

  long rCloseTimeMs = cCloseTimeMs - ( cCloseTimeMs % periodMs );
  java.util.Date rCloseTime = new java.util.Date();
  rCloseTime.setTime(rCloseTimeMs);
  foam.nanos.analytics.CandlestickId rId = new foam.nanos.analytics.CandlestickId.Builder(x)
    .setCloseTime(rCloseTime)
    .setKey(c.getKey())
    .build();

  Candlestick r = (Candlestick) getDestDAO().find(rId);
  if ( r == null ) {
    java.util.Date rOpenTime = new java.util.Date();
    rOpenTime.setTime(rCloseTimeMs - periodMs);
    r = (Candlestick) c.fclone();
    r.setOpenTime(rOpenTime);
    r.setCloseTime(rCloseTime);
    r.setKey(c.getKey());
  } else {
    r.reduce(c);
  }

  getDestDAO().put(r);
}
      `
    }
  ]
});