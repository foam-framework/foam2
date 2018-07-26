/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PreventDuplicateEmailDAO',

  documentation: 'DAO decorator that prevents putting a user with the same email',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.util.Email',
    'foam.util.SafetyUtil',
  ],

  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
  User user = (User) obj;
  boolean newUser = ( getDelegate().find(user.getId()) == null );

  if ( newUser ) {
    if ( SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new RuntimeException("Email required");
    }

    if ( ! Email.isValid(user.getEmail()) ) {
      throw new RuntimeException("Invalid Email");
    }
  }

  Count count = new Count();
  count = (Count) ((DAO) getX().get("localUserDAO"))
      .where(MLang.AND(
        MLang.EQ(User.EMAIL, user.getEmail()),
        MLang.NEQ(User.ID,  user.getId())
      )).limit(1).select(count);

  if ( count.getValue() == 1 ) {
    throw new RuntimeException("User with same email address already exists: " + user.getEmail());
  }

  return super.put_(x, obj);
      `,
   }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PreventDuplicateEmailDAO(foam.core.X x, foam.dao.DAO delegate) {
  super(x, delegate);
}
        `);
      },
    },
  ],
});
