foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LogoutDisabledUserDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that forcefully logout user who is being disabled.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'net.nanopay.model.Business',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        if (
          oldUser != null
          && oldUser.getEnabled()
          && !newUser.getEnabled()
        ) {
          sessionDAO_ = (DAO) x.get("sessionDAO");
          auth_ = (AuthService) x.get("auth");

          logoutUser(newUser, null);
          logoutAgent(newUser, newUser.getEntities(x).getDAO());
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'logoutAgent',
      javaReturns: 'void',
      args: [
        { of: 'User', name: 'user' },
        { of: 'DAO', name: 'entitiesDAO'}
      ],
      javaCode: `
        ArraySink sink = (ArraySink) entitiesDAO.select(new ArraySink());
        List<Business> businesses = sink.getArray();

        businesses.forEach((business) -> { logoutUser(user, business); });
      `
    },
    {
      name: 'logoutUser',
      javaReturns: 'void',
      args: [
        { of: 'User', name: 'user' },
        { of: 'Business', name: 'business' }
      ],
      javaCode: `
        long userId = user.getId();
        ArraySink sink = (ArraySink) sessionDAO_.where(
          MLang.EQ(Session.USER_ID,
            business != null ? business.getId() : userId))
          .select(new ArraySink());
        List<Session> sessions = sink.getArray();

        for (Session session : sessions) {
          User agent = (User) session.getContext().get("agent");
          if (
            session.getUserId() == userId
            || (agent != null && agent.getId() == userId)
          ) {
            auth_.logout(session.getContext());
          }
        }
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private DAO sessionDAO_;
          private AuthService auth_;
        `);
      }
    }
  ],
});
