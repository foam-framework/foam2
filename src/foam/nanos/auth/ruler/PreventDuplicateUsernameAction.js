/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'PreventDuplicateUsernameAction',

  documentation: `Prevents putting a user with an existing username.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'DUPLICATE_ERROR', message: 'User with same username already exists: ' },
    { name: 'EMPTY_ERROR', message: 'Username required' }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserDAO");

        User user = (User) obj;
        if ( SafetyUtil.isEmpty(user.getUserName()) ) {
          return;
          // TODO: REMOVE COMMENT ONCE READY TO MAKE USERNAME A REQUIREMENT
          // throw new RuntimeException(EMPTY_ERROR);
        }

        Count count = new Count();
        count = (Count) userDAO
            .where(AND(
              EQ(User.TYPE, user.getType()),
              EQ(User.USER_NAME, user.getUserName()),
              EQ(User.SPID, user.getSpid()),
              NEQ(User.ID,  user.getId())
            )).limit(1).select(count);

        if ( count.getValue() == 1 ) {
          throw new RuntimeException(DUPLICATE_ERROR + user.getUserName());
        }   
      `
    }
  ]
});
