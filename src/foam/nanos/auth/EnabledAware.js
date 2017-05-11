/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledAware',

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    }
  ]
});

// TODO: create an EnabledAwareDAO

// ???: Split into AuthSPI / AuthService ?
/*
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
*/

// TODO: create UserAndGroupAuthService
// TODO: create CachingAuthService
