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
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'ERROR_MSG', message: 'Error on UserCapabilityJunction checkOwnership create UCJ denied to user ' }
  ],

  methods: [
    {
      name: 'checkOwnership',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        }
      ],
      documentation: `Check if current user has permission to add this junction`,
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User realUser = subject.getRealUser();

        AuthService auth = (AuthService) x.get("auth");
        boolean isOwner = obj.getSourceId() == user.getId() || obj.getSourceId() == realUser.getId();
        if ( ! isOwner && ! auth.check(x, "*") ) throw new AuthorizationException();
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
      Subject subject = (Subject) x.get("subject");
      User user = (User) subject.getUser();
      User realUser = (User) subject.getRealUser();
      
      AuthService auth = (AuthService) x.get("auth");
      if ( auth.check(x, "*") ) return getDelegate();
      return getDelegate().where(
        OR(
          EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
          EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId())
        )
      ); 
      `
    },
    {
      name: 'remove_',
      javaCode: `
        throw new UnsupportedOperationException("UserCapabilityJunctions should be disabled via status change.");
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        throw new UnsupportedOperationException("UserCapabilityJunctions should be disabled via status change.");
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
        if ( result != null ) checkOwnership(x, (UserCapabilityJunction) result);
        return result;
      `
    }
  ]
});
