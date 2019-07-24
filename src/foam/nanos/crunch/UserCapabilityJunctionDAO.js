/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Authenticated DAO decorator to only show capabilities owned by a user. Updates can only be performed by system.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getUser',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.auth.User',
      javaCode: `
      User user = (User) x.get("user");
      if ( user == null ) throw new AuthenticationException("user not found");
      return user;
      `
    },
    {
      name: 'checkOwnership',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      documentation: `Check if current user has permission to add this junction`,
      javaCode: `
        User user = getUser(x);
        AuthService auth = (AuthService) x.get("auth");
        boolean isOwner = ((UserCapabilityJunction) obj).getSourceId() == user.getId();
        boolean hasPermission = auth.check(x, "service.*");
        if ( ! isOwner && ! hasPermission ) throw new AuthorizationException("permission denied");
      `
    },
    {
      name: 'getFilteredDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.dao.DAO',
      documentation: `Return list of junctions the current user has read access to`,
      javaCode: `
      User user = getUser(x);
      AuthService auth = (AuthService) x.get("auth");
      if ( auth.check(x, "service.*") ) return getDelegate();
      return getDelegate().where(
        EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
      ); 
      `
    },
    {
      name: 'put_', 
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      documentation: `
      Set the status of the junction before putting by checking if prerequisites are fulfilled and data required is validated.
      If status is set to GRANTED, check if junctions depending on current can be granted
      `,
      javaCode: `
      checkOwnership(x, obj);

      boolean prereq = checkPrereqs(x, obj);
      boolean data = validateData(x, obj);

      if ( prereq && data ) ((UserCapabilityJunction) obj).setStatus(CapabilityJunctionStatus.GRANTED);
      else ((UserCapabilityJunction) obj).setStatus(CapabilityJunctionStatus.PENDING);

      return getDelegate().put_(x, obj);
      
      `
    },
    {
      name: 'checkPrereqs',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'Boolean',
      documentation: `Check if prerequisites of a capability is fulfilled`,
      javaCode: `
      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      DAO prerequisiteCapabilityJunctionDAO = (DAO) (x.get("prerequisiteCapabilityJunctionDAO"));
      Capability capability = (Capability) capabilityDAO.find(((UserCapabilityJunction) obj).getTargetId());

      List<CapabilityCapabilityJunction> ccJunctions = (List<CapabilityCapabilityJunction>) ((ArraySink) prerequisiteCapabilityJunctionDAO
      .where(EQ(CapabilityCapabilityJunction.TARGET_ID, (String) capability.getId()))
      .select(new ArraySink()))
      .getArray();

      for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
        Capability cap = (Capability) ((DAO) x.get("capabilityDAO")).find((String) ccJunction.getSourceId());
        if (!cap.getEnabled()) continue;
        UserCapabilityJunction ucJunction = (UserCapabilityJunction) getDelegate().find(AND(
          EQ(UserCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getSourceId()),
          EQ(UserCapabilityJunction.TARGET_ID, (String) ccJunction.getSourceId())
        ));
        
        if ( ucJunction == null || ucJunction.getStatus() != CapabilityJunctionStatus.GRANTED ) return false;
      }
      return true;
      `
    },
    {
      name: 'validateData',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'Boolean',
      documentation: `call the validate method on data and if not "return true" then set the junction status to pending`,
      javaCode: `
        try {
          FObject data = ((UserCapabilityJunction) obj).getData();
          data.validate(x);
        } catch(Exception e) {
          return false;
        }
        return true;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      checkOwnership(x, obj);
      return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      DAO dao = getFilteredDAO(x);
      dao.removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'select_',
      javaCode: `
      DAO dao = getFilteredDAO(x);
      return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode:`
      FObject result = super.find_(x, id);
      if(result != null) checkOwnership(x, result);
      return result;
      `
    }
  ]
});
  