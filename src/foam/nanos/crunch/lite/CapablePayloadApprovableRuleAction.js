/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapablePayloadApprovableRuleAction',

  documentation: `
    TODO:
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.Subject',
    'java.util.Map'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            Approvable approvable = (Approvable) obj;
            DAO dao = (DAO) getX().get(approvable.getServerDaoKey());

            Capable capableObject = (Capable) dao.find(approvable.getObjId());

            DAO capablePayloadDAO = capableObject.getCapablePayloadDAO(x);

            if ( approvable.getOperation() == Operations.CREATE ){
              try {
                CapablePayload objectToPut =  (CapablePayload) CapablePayload.getOwnClassInfo().newInstance();

                Map propsToUpdate = approvable.getPropertiesToUpdate();

                for ( Object propName : propsToUpdate.keySet() ){
                  String propNameString = (String) propName;
                  objectToPut.setProperty(propNameString,propsToUpdate.get(propNameString));
                }

                objectToPut.setStatus(foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);

                capablePayloadDAO.put(objectToPut);

              } catch ( Exception e ){
                throw new RuntimeException(e);
              }
            } else {
              throw new RuntimeException("Unsupported approvable operation.");
            }
          }
        }, "Updated the payload based on a approved approvable");
      `
    }
  ]
});
