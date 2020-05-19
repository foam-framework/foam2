/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LogoutDisabledUserDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that forcefully logout user who is being disabled.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.session.Session',
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
          sessionDAO_ = (DAO) x.get("localSessionDAO");
          auth_ = (AuthService) x.get("auth");

          logoutUser(newUser, null);
          logoutAgent(newUser, newUser.getEntities(x).getDAO());
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'logoutAgent',
      args: [
        { type: 'foam.nanos.auth.User', name: 'agent' },
        { type: 'foam.dao.DAO', name: 'entitiesDAO' }
      ],
      javaCode: `
        ArraySink sink = (ArraySink) entitiesDAO.select(new ArraySink());
        List<User> entities = sink.getArray();

        entities.forEach((entity) -> { logoutUser(agent, entity); });
      `
    },
    {
      name: 'logoutUser',
      args: [
        { type: 'foam.nanos.auth.User', name: 'user' },
        { type: 'foam.nanos.auth.User', name: 'entity' }
      ],
      javaCode: `
        long userId = user.getId();
        ArraySink sink = (ArraySink) sessionDAO_.where(
          MLang.EQ(Session.USER_ID,
            entity != null ? entity.getId() : userId))
          .select(new ArraySink());
        List<Session> sessions = sink.getArray();

        for (Session session : sessions) {
          User agent = ((Subject) session.getContext().get("subject")).getRealUser();
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
