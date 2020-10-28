/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
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
    'foam.nanos.crunch.lite.CapablePayload',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.approval.ApprovalStatus',
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
            
            FObject objectToReput = dao.find(approvable.getObjId());

            Capable capableObjectToReput = (Capable) objectToReput;

            DAO capablePayloadDAO = capableObjectToReput.getCapablePayloadDAO(x);

            if ( approvable.getOperation() == Operations.CREATE ){
              try {
                CapablePayload capablePayloadToUpdate =  (CapablePayload) CapablePayload.getOwnClassInfo().newInstance();

                Map propsToUpdate = approvable.getPropertiesToUpdate();

                for ( Object propName : propsToUpdate.keySet() ){
                  String propNameString = (String) propName;
                  capablePayloadToUpdate.setProperty(propNameString,propsToUpdate.get(propNameString));
                }

                CapabilityJunctionStatus statusToSet = approvable.getStatus() == ApprovalStatus.APPROVED 
                  ? CapabilityJunctionStatus.APPROVED
                  : CapabilityJunctionStatus.REJECTED;

                capablePayloadToUpdate.setStatus(statusToSet);
                capablePayloadToUpdate.setHasSafeStatus(true);

                // first update the object's capable payloads
                capablePayloadDAO.put(capablePayloadToUpdate);

                // then reput the actual capable object into it's dao
                dao.put(objectToReput);
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
