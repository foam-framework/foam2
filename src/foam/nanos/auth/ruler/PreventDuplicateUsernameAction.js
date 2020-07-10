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
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'DUPLICATE_ERROR', message: 'User with same username already exists: ' }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO userDAO = (DAO) x.get("localUserDAO");

        if ( obj instanceof Business || obj instanceof Contact ) {
          return;
        }

        User user = (User) obj;
        if ( SafetyUtil.isEmpty(user.getUserName()) ) {
          return;
        }

        Count count = new Count();
        count = (Count) userDAO
            .where(AND(
              EQ(User.USER_NAME, user.getUserName()),
              NEQ(User.ID,  user.getId())
            )).limit(1).select(count);

        if ( count.getValue() == 1 ) {
          throw new RuntimeException(DUPLICATE_ERROR + user.getUserName());
        }   
      `
    }
  ]
});
