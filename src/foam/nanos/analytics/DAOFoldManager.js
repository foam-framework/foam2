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

  javaImports: [
    'foam.core.X',
    'java.util.Date'
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
    },
    {
      class: 'Object',
      javaType: 'Object[]',
      name: 'locks',
      transient: true,
      javaFactory: `
        Object[] locks = new Object[128];
        for ( int i = 0 ; i < locks.length ; i++ )
          locks[i] = new Object();
        return locks;
      `
    }
  ],

  methods: [
    {
      name: 'getLock',
      type: 'Object',
      args: [
        { name: 'key', type: 'Object' }
      ],
      javaCode: `
        int hash = key.hashCode();
        Object[] locks = getLocks();
        return locks[(int) (Math.abs(hash) % locks.length)];
      `
    },
    {
      name: 'foldForState',
      javaCode: `
        X x = getX();

        CandlestickId id = new CandlestickId();
        id.setCloseTime((java.util.Date) getCloseTimeExpr().f(time));
        id.setKey(key);
        id.init_();

        synchronized ( getLock(key) ) {
          Candlestick c = (Candlestick) getDao().find(id);

          if ( c == null ) {
            c = new Candlestick(x);
            c.setCloseTime(id.getCloseTime());
            c.setKey(key);
            c.init_();
          } else {
            c = (Candlestick) c.fclone();
          }

          c.add(value, time);

          getDao().put(c);
        }
      `
    }
  ]
});
