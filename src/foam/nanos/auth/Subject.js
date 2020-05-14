/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Subject',

  javaImports: [
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'java.util.Stack'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      documentation: 'Authenticated user',
      javaSetter: `
        if ( user_ != null ) {
          throw new RuntimeException("User is already set in the context");
        }
        user_ = val;
        userIsSet_ = true;
        setEffectiveUser(val);
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'effectiveUser',
      documentation: 'Current user role(acts as effectiveUser)',
      javaSetter: `
      if ( getUser() == null ) {
          user_ = val;
          userIsSet_ = true;
      }
      ArrayList userPath = getUserPath();
      if ( userPath.size() < 2 || val != (User) userPath.get(userPath.size() - 1) ) {
        userPath.add(val);
      }
      else {
        userPath.remove(userPath.size());
      }
      effectiveUserIsSet_ = true;
      effectiveUser_ = val;
      `
    },
    {
      class: 'List',
      javaType: 'java.util.ArrayList<User>',
      name: 'userPath',
      documentation: 'path from user to effectiveUser',
      javaFactory: 'return new ArrayList();'
    },
  ],

  methods: [
    {
      name: 'toString',
      type: 'String',
      javaCode: `
      String ret = "";
      for ( User user : getUserPath() ) {
          ret += " >> " + user.getUserName() + "( " + user.getId() + " )";
      }
      return ret;
`
     }
  ]
})
