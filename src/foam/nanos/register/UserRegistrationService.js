/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.register',
  name: 'UserRegistrationService',

  implements: [
    'foam.nanos.NanoService',
    'foam.nanos.register.RegistrationService'
  ],

  imports: [
    'groupDAO',
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.crypto.Password'
  ],

  properties: [
    {
      class: 'String',
      name: 'groupId'
    }
  ],

  methods: [
    {
      name: 'register',
      javaCode:
`if ( user == null ) {
  throw new RuntimeException("Invalid user");
}

if ( "".equals(user.getEmail()) ) {
  throw new RuntimeException("Email required");
}

if ( "".equals(user.getFirstName()) ) {
  throw new RuntimeException("First name required");
}

if ( "".equals(user.getLastName()) ) {
  throw new RuntimeException("Last name required");
}

if ( "".equals(user.getPassword()) ) {
  throw new RuntimeException("Password required");
}

Group group = (Group) ((DAO) getGroupDAO()).find(getGroupId());
if ( group == null ) {
  throw new RuntimeException("Invalid group");
}

user.setGroup(group);
user.setPassword(Password.hash(user.getPassword()));
return (User) ((DAO) getLocalUserDAO()).put(user);`
    },
    { name: 'start' }
  ]
});