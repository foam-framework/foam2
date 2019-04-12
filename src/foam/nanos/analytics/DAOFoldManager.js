foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'DAOFoldManager',
  implements: [
    'foam.nanos.analytics.FoldManager'
  ],
  requires: [
    'foam.nanos.analytics.Candlestick'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'Long',
      name: 'periodLengthMs'
    }
  ],
  methods: [
    {
      name: 'getCurrentCloseTime',
      type: 'Date',
      javaCode: `
long periodMs = getPeriodLengthMs();
long currentMs = new java.util.Date().getTime();

java.util.Date close = new java.util.Date();
close.setTime((currentMs / periodMs) * periodMs + periodMs);
return close;
      `
    },
    {
      name: 'foldForState',
      javaCode: `
foam.core.X x = getX();
java.util.Date closeTime = getCurrentCloseTime();

foam.nanos.analytics.CandlestickId id = new foam.nanos.analytics.CandlestickId.Builder(x)
  .setCloseTime(closeTime)
  .setKey(key)
  .build();

foam.nanos.analytics.Candlestick c = (foam.nanos.analytics.Candlestick) getDao().find(id);
if ( c == null ) {
  java.util.Date openTime = new java.util.Date();
  openTime.setTime(closeTime.getTime() - getPeriodLengthMs());

  c = new foam.nanos.analytics.Candlestick.Builder(x)
    .setCloseTime(closeTime)
    .setOpenTime(openTime)
    .setKey(key)
    .build();
}
c.add(value);

getDao().put(c);
      `
    }
  ]
});