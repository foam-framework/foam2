foam.CLASS({
  package: 'foam.nanos.monitor.test',
  name: 'TestMonitor',

  documentation: ``,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.monitor.Alarm',
    'foam.nanos.monitor.Monitor',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
    Logger logger = (Logger) x.get("logger");
    logger.info(this.getClass().getSimpleName(), "applyAction");
    if ( obj instanceof Monitor ) {
      Monitor monitor = (Monitor) obj.fclone();
      Alarm alarm = monitor.findAlarm(getX());
      if ( alarm == null ) {
        alarm = new Alarm.Builder(getX()).setName("OK").build();
      } else {
        alarm = (Alarm) alarm.fclone();
      }
      alarm.setRepeated(alarm.getRepeated() + 1);
      alarm = (Alarm) monitor.getAlarms(getX()).put(alarm);
      monitor.setAlarm(alarm.getId());
      ((foam.dao.DAO) getX().get("monitorDAO")).put(monitor);
    }
    `
    }
  ]
});
