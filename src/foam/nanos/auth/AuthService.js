/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AuthService',
  methods: [
		{
  		name: 'generateChallenge',
			javaReturns: 'String',
			args: [
				{
					name: 'username',
					javaType: 'String'
				}
			]
    },
		{
			name: 'login',
			javaReturns: 'void',
			javaThrows: [ 'LoginException' ],
			args: [
				{
					name: 'x',
					javaType: 'X'
				},
				{
					name: 'response',
					javaType: 'String'
				}
			]
		},
		{
			name: 'loginString',
			javaReturns: 'void',
			args: [
				{
					name: 'username',
					javaType: 'String'
				},
				{
					name: 'password',
					javaType: 'String'
				}
			]
		},
		{
			name: 'logout',
			javaReturns: 'void',
			args: [
				{
					name: 'username',
					javaType: 'String'
				}
			]
		},
		{
			name: 'check',
			javaReturns: 'Boolean',
			args: [
				{
					name: 'x',
					javaType: 'X'
				},
				{
					name: 'principal',
					javaType: 'java.security.Principal'
				},
				{
					name: 'permission',
					javaType: 'java.security.Permission'
				}
			]
		},
		{
			name: 'updatePassword',
			javaReturns: 'void',
			javaThrows: [ 'IllegalStateException' ],
			args: [
				{
					name: 'x',
					javaType: 'X'
				},
				{
					name: 'principal',
					javaType: 'java.security.Principal'
				},
				{
					name: 'oldPassword',
					javaType: 'String'
				},
				{
					name: 'newPassword',
					javaType: 'String'
				}
			]
		},
		{
			name: 'validatePrincipal',
			javaReturns: 'void',
			javaThrows: [ 'IllegalStateException' ],
			args: [
				{
					name: 'x',
					javaType: 'X'
				},
				{
					name: 'oldValue',
					javaType: 'java.security.Principal'
				},
				{
					name: 'newValue',
					javaType: 'java.security.Principal'
				}
			]
		}
  ]
});

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
