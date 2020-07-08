/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
    package: 'foam.nanos.dig',
    name: 'DIGOwnerRuleAction',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    documentation: 'Set owner on new DIG',
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.dig.DIG',
      'foam.nanos.auth.Subject'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
                if ( obj instanceof DIG) {
                    var dig = (DIG) obj;
                    dig.setOwner(((Subject)x.get("subject")).getRealUser().getId());
                }
            }
          }, "DIG owner");
        `
      }
    ]
  });
  