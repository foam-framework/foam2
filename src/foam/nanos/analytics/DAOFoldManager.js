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
      name: 'periodLengthMs'
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
        X    x         = getX();
        long periodMs  = getPeriodLengthMs();
        Date closeTime = new Date();

        closeTime.setTime((time.getTime() / periodMs) * periodMs + periodMs);

        CandlestickId id = new CandlestickId();
        id.setCloseTime(closeTime);
        id.setKey(key);
        id.init_();

        synchronized ( getLock(key) ) {
          Candlestick c = (Candlestick) getDao().find(id);
          if ( c == null ) {
            Date openTime = new Date();
            openTime.setTime(closeTime.getTime() - getPeriodLengthMs());

            c = new Candlestick(x);
            c.setCloseTime(closeTime);
            c.setOpenTime(openTime);
            c.setKey(key);
            c.init_();
          }
          c.add(value, time);

          getDao().put(c);
        }
      `
    }
  ]
});
