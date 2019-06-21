foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CapabilityAuthService',
  extends: 'foam.nanos.auth.UserAndGroupAuthService',

  implements: [
    'foam.nanos.auth.AuthService',
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  imports: [

  ],

  methods: [
    {
      name: 'check',
      documentation: `
      check a permission of current by checking whether the capabilities of the user implies the permission
      `,
      javaCode: `
      if ( x == null || permission == null ) return false;

      Session session = x.get(Session.class);
      if(session == null || session.getUserId() == 0) return false;
      User user = (User) x.get("user");
      if(user == null || !user.getEnabled()) return false;

      return checkUser(x, user, permission);
      `
    }, 
    {
      name: 'checkUser',
      javaCode: `
      if ( x == null || user == null || permission == null) return false;

      try {
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        List<UserCapabilityJunction> userCapabilityJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
          .where(AND(
            EQ(UserCapabilityJunction.USER_ID, user.getId()),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          )) 
          .select(new ArraySink()))
          .getArray();
        
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");

        for(UserCapabilityJunction ucJunction : userCapabilityJunctions) {
          Capability capability = (Capability) capabilityDAO.find(ucJunction.getCapabilityId());
          if(capability.implies(x, permission)) return true;
        }
      } catch (Exception e) {
        Logger logger = (Logger) x.get("logger");
        logger.error("check", permission, e);
      } catch (Throwable t) {
      } 
      return false;
      
      `
    },
    {
      name: 'checkPermission',
      javaCode: `
      return check(x, permission.getName());
      `
    },
    {
      name: 'checkUserPermission',
      javaCode: `
      return checkUser(x, user, permission.getName());
      `
    },
  ]
});