/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserAndGroupAuthService',
  flags: ['java'],

  implements: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.NanoService'
  ],

  imports: [
    'localGroupDAO',
    'localSessionDAO',
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'foam.util.Email',
    'foam.util.Password',
    'foam.util.SafetyUtil',

    'java.util.Calendar',
    'java.util.regex.Pattern',
    'javax.security.auth.AuthPermission',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  constants: [
    {
      name: 'PASSWORD_VALIDATE_REGEX',
      type: 'String',
      value: '^.{6,}$'
    },
    {
      name: 'PASSWORD_VALIDATION_ERROR_MESSAGE',
      type: 'String',
      value: 'Password must be at least 6 characters long.'
    },
    {
      name: 'CHECK_USER_PERMISSION',
      type: 'String',
      value: 'service.auth.checkUser'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: '// nothing here'
    },
    {
      name: 'getCurrentUser',
      javaCode: `
        Session session = x.get(Session.class);
        
        // fetch context and check if not null or user id is 0
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("Not logged in");
        }

        // get user from session id
        User user = (User) ((DAO) getLocalUserDAO()).find(session.getUserId());
        if ( user == null ) {
          throw new AuthenticationException("User not found: " + session.getUserId());
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // check if group enabled
        Group group = getCurrentGroup(x);
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("Group disabled");
        }

        // check for two-factor authentication
        if ( user.getTwoFactorEnabled() && ! session.getContext().getBoolean("twoFactorSuccess") ) {
          throw new AuthenticationException("User requires two-factor authentication");
        }

        return user;
      `
    },
    {
      name: 'loginHelper',
      documentation: `Helper function to reduce duplicated code.`,
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // check if group enabled
        Group group = user.findGroup(x);
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("Group disabled");
        }

        if ( ! Password.verify(password, user.getPassword()) ) {
          throw new AuthenticationException("Invalid Password");
        }

        // Freeze user
        user = (User) user.fclone();
        user.freeze();

        Session session = x.get(Session.class);
        session.setUserId(user.getId());
        session.setContext(session.getContext().put("user", user).put("group", group));

        return user;
      `
    },
    {
      name: 'login',
      documentation: `Login a user by the id provided, validate the password and
        return the user in the context`,
      javaCode: `
        if ( userId < 1 || SafetyUtil.isEmpty(password) ) {
          throw new AuthenticationException("Invalid Parameters");
        }

        return loginHelper(x, (User) ((DAO) getLocalUserDAO()).find(userId), password);
      `
    },
    {
      name: 'loginByEmail',
      javaCode: `
        User user = (User) ((DAO) getLocalUserDAO()).find(
          AND(
            EQ(User.EMAIL, email.toLowerCase()),
            EQ(User.LOGIN_ENABLED, true)
          )
        );

        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }
        return loginHelper(x, user, password);
      `
    },
    {
      name: 'checkUserPermission',
      documentation: `Checks if the user passed into the method has the passed
        in permission attributed to it by checking their group. No check on User
        and group enabled flags.`,
      javaCode: `
        // check whether user has permission to check user permissions
        if ( ! check(x, CHECK_USER_PERMISSION) ) throw new AuthorizationException();

        if ( user == null || permission == null ) return false;

        try {
          String groupId = (String) user.getGroup();

          while ( ! SafetyUtil.isEmpty(groupId) ) {
            Group group = (Group) ((DAO) getLocalGroupDAO()).find(groupId);

            // if group is null break
            if ( group == null ) break;

            // check permission
            if ( group.implies(x, permission) ) return true;

            // check parent group
            groupId = group.getParent();
          }
        } catch (Throwable t) {
        }

        return false;
      `
    },
    {
      name: 'check',
      documentation: `Check if the user in the context supplied has the right
        permission.`,
      javaCode: `
        if ( x == null || permission == null ) return false;

        java.security.Permission p = new AuthPermission(permission);

        try {
          Group group = getCurrentGroup(x);

          while ( group != null ) {

            // check permission
            if ( group.implies(x, p) ) return true;

            // check parent group
            group = (Group) ((DAO) getLocalGroupDAO()).find(group.getParent());
          }
        } catch (IllegalArgumentException e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", p, e);
        } catch (Throwable t) {
        }

        return false;
      `
    },
    {
      name: 'validatePassword',
      javaCode: `
        if ( SafetyUtil.isEmpty(potentialPassword) || ! (Pattern.compile(PASSWORD_VALIDATE_REGEX)).matcher(potentialPassword).matches() ) {
          throw new RuntimeException(PASSWORD_VALIDATION_ERROR_MESSAGE);
        }
      `
    },
    {
      name: 'checkUser',
      javaCode: `
        return checkUserPermission(x, user, new AuthPermission(permission));
      `
    },
    {
      name: 'updatePassword',
      documentation: `Given a context with a user, validate the password to be
        updated and return a context with the updated user information.`,
      javaCode: `
        if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
          throw new RuntimeException("Password fields cannot be blank");
        }

        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("User not found");
        }

        User user = (User) ((DAO) getLocalUserDAO()).find(session.getUserId());
        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // check if group enabled
        Group group = user.findGroup(x);
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("Group disabled");
        }

        // check if password is valid per validatePassword method
        validatePassword(newPassword);

        // old password does not match
        if ( ! Password.verify(oldPassword, user.getPassword()) ) {
          throw new RuntimeException("Old password is incorrect");
        }

        // new password is the same
        if ( Password.verify(newPassword, user.getPassword()) ) {
          throw new RuntimeException("New password must be different");
        }

        // store new password in DAO and put in context
        user = (User) user.fclone();
        user.setPasswordLastModified(Calendar.getInstance().getTime());
        user.setPreviousPassword(user.getPassword());
        user.setPassword(Password.hash(newPassword));
        // TODO: modify line to allow actual setting of password expiry in cases where users are required to periodically update their passwords
        user.setPasswordExpiry(null);
        user = (User) ((DAO) getLocalUserDAO()).put(user);
        session.setContext(session.getContext().put("user", user).put("group", group));
        return user;
      `
    },
    {
      name: 'validateUser',
      documentation: `Used to validate properties of a user. This will be called
        on registration of users. Will mainly be used as a veto method. Users
        should have id, email, first name, last name, password for registration`,
      javaCode: `
        if ( user == null ) {
          throw new AuthenticationException("Invalid User");
        }

        if ( SafetyUtil.isEmpty(user.getEmail()) ) {
          throw new AuthenticationException("Email is required for creating a user");
        }

        if ( ! Email.isValid(user.getEmail()) ) {
          throw new AuthenticationException("Email format is invalid");
        }

        if ( SafetyUtil.isEmpty(user.getFirstName()) ) {
          throw new AuthenticationException("First Name is required for creating a user");
        }

        if ( SafetyUtil.isEmpty(user.getLastName()) ) {
          throw new AuthenticationException("Last Name is required for creating a user");
        }

        if ( SafetyUtil.isEmpty(user.getPassword()) ) {
          throw new AuthenticationException("Password is required for creating a user");
        }

        validatePassword(user.getPassword());
      `
    },
    {
      name: 'logout',
      documentation: `Just return a null user for now. Not sure how to handle
        the cleanup of the current context.`,
      javaCode: `
        Session session = x.get(Session.class);
        if ( session != null && session.getUserId() != 0 ) {
          ((DAO) getLocalSessionDAO()).remove(session);
        }
      `
    },
    {
      name: 'getCurrentGroup',
      documentation: `Gets the effective group from a context.`,
      javaCode: `
        // Highest precedence: Just return the group from the context if it's already
        // been set.
        Group group = (Group) x.get("group");

        if ( group != null ) return group;

        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

        // Second highest precedence: If one user is acting as another, return the
        // group on the junction between them.
        if ( user != null ) {
          if ( agent != null ) {
            DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
            UserUserJunction junction = (UserUserJunction) agentJunctionDAO.inX(x).find(
              AND(
                EQ(UserUserJunction.SOURCE_ID, agent.getId()),
                EQ(UserUserJunction.TARGET_ID, user.getId())
              )
            );

            if ( junction == null ) {
              throw new RuntimeException("There was a user and an agent in the context, but a junction between then was not found.");
            }

            return (Group) ((DAO) getLocalGroupDAO()).inX(x).find(junction.getGroup());
          }

          // Third highest precedence: If a user is logged in but not acting as
          // another user, return their group.
          return user.findGroup(x);
        }

        // If none of the cases above match, return null.
        // TODO: Should this throw an error instead?
        return null;
      `
    }
  ]
});
