/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProvider',
  extends: 'foam.nanos.crunch.Capability',

  documentation: 'Service Provider Capability',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.stream.Collectors',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'Service provider name',
      validationPredicates: [
        {
          args: ['id'],
          predicateFactory: function(e) {
            return e.REG_EXP(foam.nanos.auth.ServiceProvider.ID, /^[a-z0-9]+$/);
          },
          errorString: 'Invalid character(s) in id.'
        }
      ]
    },
    {
      class: 'String',
      name: 'name',
      javaFactory: `
        return "*".equals(getId()) ? "Global Service Provider Capability" :
          getId().substring(0, 1).toUpperCase() + getId().substring(1) + " Service Provider Capability";
      `
    },
    {
      name: 'permissionsGranted',
      transient: true,
      javaGetter: 'return new String[] { "serviceprovider.read." + getId() };',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'setupSpid', 
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      documentation: `
        Method responsible for setting up a user's ServiceProvider capability by finding
        the prerequisites of the ServiceProvider and granting those along with it
      `,
      javaCode: `           
        Logger logger = (Logger) x.get("logger");
        DAO userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        // get grantPath of the service provider capability
        List<Capability> grantPath = (List<Capability>) crunchService.getCapabilityPath(x, getId(), false);

        try {
          // for each capability in the grantPath of the spid capability,
          // find the ucj and update its status to granted, or create a ucj none found
          
          UserCapabilityJunction ucj;
          for ( Capability capability : grantPath ) {
            ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
              EQ(UserCapabilityJunction.TARGET_ID, capability.getId())
            ));
            if ( ucj != null ) 
              ucj = (UserCapabilityJunction) ucj.fclone();
            else 
              ucj = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(capability.getId()).build();
            ucj.setStatus(CapabilityJunctionStatus.GRANTED);
            ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, ucj);
            if ( ucj == null || ucj.getStatus() !=foam.nanos.crunch.CapabilityJunctionStatus.GRANTED )
              throw new RuntimeException("Error setting up UserCapabilityJunction for user: " + user.getId() + " and spid: " + getId());
          }
        } catch (Exception e) {
          logger.error(e);
        }
      `
    },
    {
      name: 'removeSpid',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      documentation: `
        Method used for removing a user's old ServiceProvider capability and any capability that is a part
        of that capability through prerequisite junctions.
        Called before a user is assigned a new ServiceProvider capability
      `,
      javaCode: `
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        DAO userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");

        // find list of old spids to remove from user
        AbstractPredicate serviceProviderTargetPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            UserCapabilityJunction ucJunction = (UserCapabilityJunction) obj;
            Capability c = (Capability) ucJunction.findTargetId(x);
            return c instanceof ServiceProvider;
          }
        };
        List<UserCapabilityJunction> spidsToRemove = (ArrayList<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
          .where(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            NEQ(UserCapabilityJunction.TARGET_ID, getId()),
            serviceProviderTargetPredicate
          )).select(new ArraySink())).getArray();

        // for each old spid, get its capabilityPath, and remove all ucjs on the capabilityPath

        for ( UserCapabilityJunction sp : spidsToRemove ) {
          List<Capability> capabilitiesToRemove = (List<Capability>) crunchService.getCapabilityPath(x, sp.getTargetId(), false);
          List<String> targetIdsToRemove = capabilitiesToRemove.stream().map(c -> c.getId()).collect(Collectors.toList());

          userCapabilityJunctionDAO.where(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            IN(UserCapabilityJunction.TARGET_ID, targetIdsToRemove)
          )).removeAll();
        }
      `
    }
  ]
});
