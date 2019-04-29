foam.CLASS({
  package: 'foam.nanos.monitor.test',
  name: 'TestMonitorPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.monitor.Monitor'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
    Logger logger = (Logger) getX().get("logger");
    if ( logger != null ) {
      logger.info(this.getClass().getSimpleName(), "f");
    }

    return AND(
      EQ(DOT(NEW_OBJ, INSTANCE_OF(Monitor.getOwnClassInfo())), true),
      EQ(DOT(NEW_OBJ, Monitor.NAME), "TestMonitor")
    ).f(obj);
    `
    }
  ]
});
