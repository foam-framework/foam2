foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `UserCapabilityJunctionDAO requires a custom authenticated DAO decorator to only show capabilities owned by a user. Updates can only be performed by system.`,

  // TODO RUBY checkownership and getfiltereddao auth.check(x, "something else")?

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
    'static foam.mlang.MLang.*',
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
      if(user == null) throw new AuthenticationException("user not found");
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
      javaCode: `
        User user = getUser(x);
        AuthService auth = (AuthService) x.get("auth");
        boolean isOwner = ((UserCapabilityJunction) obj).getSourceId() == user.getId();
        boolean hasPermission = auth.check(x, "service.*");
        if(!isOwner && !hasPermission) throw new AuthorizationException("permission denied");
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
      javaCode: `
      User user = getUser(x);
      AuthService auth = (AuthService) x.get("auth");
      if( auth.check(x, "service.*") ) return getDelegate();
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
      `,
      javaCode: `
      checkOwnership(x, obj);
      checkPrereqs(x, obj);
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
      documentation: `if status set to granted check prereqs before put`,
      javaCode: `
      if(((UserCapabilityJunction) obj).getStatus() == CapabilityJunctionStatus.GRANTED) {
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        Capability capability = (Capability) capabilityDAO.find(((UserCapabilityJunction) obj).getTargetId());
        for(String prereq : (String[]) capability.getCapabilitiesRequired()) {
          Capability cap = (Capability) ((DAO) x.get("capabilityDAO")).find(prereq);
          if(!cap.getEnabled()) continue;
          List<UserCapabilityJunction> ucJunctions = (List<UserCapabilityJunction>) ((ArraySink) getDelegate()
          .where(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getSourceId()),
            EQ(UserCapabilityJunction.TARGET_ID, prereq)
          )) 
          .select(new ArraySink()))
          .getArray();
          if(ucJunctions.size() == 0 || ucJunctions.get(0).getStatus() != CapabilityJunctionStatus.GRANTED) throw new AuthorizationException("One or more prerequisite capabilities not fulfilled");
        }
      }
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
      return super.find_(x, id);
      `
    },
  ]
});
  