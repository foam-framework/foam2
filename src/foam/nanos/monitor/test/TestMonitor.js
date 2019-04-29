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
      Alarm alarm = monitor.findAlarm(x);
      if ( alarm == null ) {
        alarm = new Alarm.Builder(x).setName("OK").build();
      } else {
        alarm = (Alarm) alarm.fclone();
      }
      alarm.setRepeated(alarm.getRepeated() + 1);
      alarm = (Alarm) monitor.getAlarms(x).put(alarm);
      monitor.setAlarm(alarm.getId());
    }
    `
    }
  ]
});
