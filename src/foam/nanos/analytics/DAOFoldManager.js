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
      name: 'foldForState',
      synchronized: true,
      javaCode: `
foam.core.X x = getX();

foam.nanos.analytics.CandlestickId id = new foam.nanos.analytics.CandlestickId.Builder(x)
  .setCloseTime((java.util.Date) getCloseTimeExpr().f(time))
  .setKey(key)
  .build();

foam.nanos.analytics.Candlestick c = (foam.nanos.analytics.Candlestick) getDao().find(id);
if ( c == null ) {
  c = new foam.nanos.analytics.Candlestick.Builder(x)
    .setCloseTime(id.getCloseTime())
    .setKey(key)
    .build();
}
c.add(value, time);

getDao().put(c);
      `
    }
  ]
});
