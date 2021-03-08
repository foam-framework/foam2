/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmHostnameRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Set hostname on new Alarm',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Alarm alarm = (Alarm) obj;
            if ( SafetyUtil.isEmpty(alarm.getHostname()) ) {
              alarm.setHostname(System.getProperty("hostname", "localhost"));
            }
          }
        }, "Alarm hostname");
      `
    }
  ]
});
