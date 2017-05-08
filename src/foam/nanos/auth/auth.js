foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledAware',

  properties: [
    class: 'Boolean'
    name: 'enabled',
    value: true
  ]
});

// TODO: create an EnabledAwareDAO


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAware',

  properties: [
    class: 'DateTime'
    name: 'lastModified',
    factory: function() { new Date(); }
  ]
});

// TODO: create a LastModifiedAwareDAO


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAware',

  properties: [
    class: 'DateTime'
    name: 'lastModifiedBy'
  ]
});

// TODO: create a LastModifiedByAwareDAO



foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Language',

  documentation: '',

  ids: [ 'code' ],

  properties: [
    'code',
    'name'
  ]
});


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Permission',

  documentation: '',

  properties: [
    'id'
  ]
});


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Group',

  implements: [
    'EnabledAware'
  ],

  documentation: 'A Group of Users.',

  properties: [
    {
      class: 'String',
      name: 'id',
      documenation: 'Unique name of the Group.'
    },
    {
      class: 'String',
      name: 'description',
      documenation: 'Description of the Group.'
    },
    {
      class: 'String',
      name: 'parent',
      documentation: 'Parent group to inherit permissions from.'
    },
    /*
      FUTURE
    {
      class: 'FObjectProperty',
      of: 'AuthConfig',
      documentation: 'Custom authentication settings for this group.'
    }
    */

  ]
});


foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'net.nanopay.auth.Group',
  targetModel: 'net.nanopay.b2b.Permission',
  forwardName: 'permissions',
  inverseName: 'groups',
  sourceProperty: {
    hidden: true
  }
});


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Login',

  documentation: 'Login information.',

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'Password',
      name: 'password',
      displayWidth: 30,
      width: 100
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ChangePassword',

  documentation: 'Login information.',

  properties: [
    {
      class: 'Password',
      name: 'oldPassword',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'Password',
      name: 'newPassword',
      displayWidth: 30,
      width: 100
      // TODO: custom view
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'User',

  implements: [
    'EnabledAware',
    'LastModifiedAware',
    'LastModifiedByAware'
  ],

  documentation: '',

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'SPID',
      label: 'Service Provider',
      name: 'spid',
      documentation: "User's service provider."
    }
    {
      class: 'DateTime',
      name: 'lastLogin'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'organization'
    },
    {
      class: 'String',
      name: 'department'
    },
    {
      class: 'Email',
      name: 'email'
    },
    {
      class: 'Phone',
      name: 'phone'
    },
    {
      class: 'Phone',
      name: 'mobile'
    },
    {
      class: 'Reference',
      of: 'Language',
      value: 'en'
    },
    {
      class: 'String',
      name: 'timeZone'
      // TODO: create custom view or DAO
    },
    {
      class: 'Password',
      name: 'password',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'Password',
      name: 'previousPassword',
      displayWidth: 30,
      width: 100
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified'
    },
    // TODO: startDate, endDate,
    // TODO: do we want to replace 'note' with a simple ticket system?
    {
      class: 'String',
      name: 'note',
      displayWidth: 70,
      displayHeight: 10
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'net.nanopay.auth.User',
  targetModel: 'net.nanopay.b2b.Group',
  forwardName: 'groups',
  inverseName: 'users',
  sourceProperty: {
    hidden: true
  }
});


// ???: Split into AuthSPI / AuthService ?
foam.INTERFACE({

  interface AuthService {

  String generateChallenge(String username);

  void login(X x, String response)
    throws LoginException;

  void login(String username, String password);

  // Is this needed?
  void logout(String username);

  // Use standard Java types or FOAM-specific?
  public boolean check(X x, java.security.Principal principal, java.security.Permission permission);

  public void updatePassword(X x, Principal principal, String oldPassword, String newPassword)
    throws IllegalStateException;

  public void validatePrincipal(X x, Principal oldValue, Principal newValue)
    throws IllegalStateException;

}


// TODO: create UserAndGroupAuthService
// TODO: create CachingAuthService
