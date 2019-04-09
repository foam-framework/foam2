/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'CandlestickDAODecorator',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.MDAO',
    'foam.nanos.analytics.Candlestick'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'candlestickDAO'
    },
    {
      class: 'String',
      name: 'timeProp'
    },
    {
      class: 'String',
      name: 'valueProp'
    },
    {
      class: 'Long',
      name: 'periodLengthMs'
    },
    {
      class: 'StringArray',
      name: 'groupBy'
    }
  ],
  methods: [
    {
      name: 'put_',
      javaCode: `
        obj = getDelegate().put_(x, obj);

        long ms = ((java.util.Date) obj.getProperty(getTimeProp())).getTime();
        long periodMs = getPeriodLengthMs();
        java.util.Date end = new java.util.Date();
        end.setTime((ms / periodMs) * periodMs + periodMs);

        Object[] grouping = new Object[getGroupBy().length];
        for ( int i = 0 ; i < getGroupBy().length ; i++ ) {
          grouping[i] = obj.getProperty(getGroupBy()[i]);
        }

        foam.nanos.analytics.CandlestickId id = new foam.nanos.analytics.CandlestickId.Builder(x)
          .setEnd(end)
          .setGrouping(grouping)
          .build();

        foam.nanos.analytics.Candlestick c =
          (foam.nanos.analytics.Candlestick) getCandlestickDAO().find(id);
        c = c != null ? c : new foam.nanos.analytics.Candlestick.Builder(x)
          .setEnd(end)
          .setGrouping(grouping)
          .build();
        c.add(
          ((java.lang.Number) obj.getProperty(getValueProp())).floatValue(),
          (java.util.Date) obj.getProperty(getTimeProp()));
        getCandlestickDAO().put_(x, c);

        return obj;
      `
    }
  ]
});