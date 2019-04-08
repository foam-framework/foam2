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

        foam.nanos.analytics.Candlestick c =
          (foam.nanos.analytics.Candlestick) getCandlestickDAO().find(end);
        c = c != null ? c : new foam.nanos.analytics.Candlestick.Builder(x)
          .setEnd(end)
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