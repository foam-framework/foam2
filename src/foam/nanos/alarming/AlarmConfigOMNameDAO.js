foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmConfigOMNameDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Load OMName with AlarmConfig names on select, as OMName is MDAO only to support creating alarms before the OM has been generated.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.Sink',
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new AlarmConfigOMNameSink(x, sink, (DAO) x.get("omNameDAO"));
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    }
  ]
 });
