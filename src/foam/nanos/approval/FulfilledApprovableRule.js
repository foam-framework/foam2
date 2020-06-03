/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'FulfilledApprovableRule',

  documentation: `
    A rule to determine what to do with an approvable once the 
    approval request has been APPROVED
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.LifecycleAware',
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

            FObject objectToPut;

            if ( approvable.getOperation() == Operations.CREATE ){
              try {
                objectToPut =  (FObject) approvable.getOf().newInstance();
              } catch ( Exception e ){
                throw new RuntimeException(e);
              }
              LifecycleAware lifecycleAwareObject = (LifecycleAware) objectToPut;
              lifecycleAwareObject.setLifecycleState(LifecycleState.ACTIVE);
            } else if ( approvable.getOperation() == Operations.UPDATE ){
              FObject currentObjInDao = dao.find(approvable.getObjId());
              objectToPut = currentObjInDao.fclone();
            } else {
              throw new RuntimeException("Unsupported approvable operation.");
            }

            Map propsToUpdate = approvable.getPropertiesToUpdate();

            for ( Object propName : propsToUpdate.keySet() ){
              String propNameString = (String) propName;
              objectToPut.setProperty(propNameString,propsToUpdate.get(propNameString));
            }

            User createdBy = (User) ((DAO) x.get("bareUserDAO")).find(approvable.getCreatedBy());

            Subject subject = new Subject.Builder(x).setUser(createdBy).build();
            X createdX = x.put("subject", subject);

            dao.inX(createdX).put(objectToPut);
          }
        }, "Updated the object based on a approved approvable");
      `
    }
  ]
});
