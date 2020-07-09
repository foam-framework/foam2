/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
    package: 'foam.nanos.dig',
    name: 'SUGAROwnerRuleAction',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    documentation: 'Set owner on new SUGAR',
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.dig.SUGAR',
      'foam.nanos.auth.Subject'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
                if ( obj instanceof SUGAR) {
                    var sugar = (SUGAR) obj;
                    sugar.setOwner(((Subject)x.get("subject")).getRealUser().getId());
                }
            }
          }, "SUGAR owner");
        `
      }
    ]
  });
  