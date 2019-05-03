/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      name: 'foldForState',
      // TODO: use a more efficient key based lock
      synchronized: true,
      javaCode: `
foam.core.X x = getX();

long periodMs = getPeriodLengthMs();
java.util.Date closeTime = new java.util.Date();
closeTime.setTime((time.getTime() / periodMs) * periodMs + periodMs);

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
c.add(value, time);

getDao().put(c);
      `
    }
  ]
});