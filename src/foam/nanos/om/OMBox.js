foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMBox',
  extends: 'foam.box.ProxyBox',

  properties: [
    {
      name: 'name',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      getDelegate().send(msg);
      try {
      ((OMLogger) getX().get("OMLogger")).log(getName());
      } catch ( Throwable t ) {
        ((foam.nanos.logger.Logger) getX().get("logger")).error("OMBox", t.getMessage());
//        ((foam.nanos.logger.Logger) getX().get("logger")).error("OMBox", t.getMessage(), t);
      }
      `
    }
  ]
});
