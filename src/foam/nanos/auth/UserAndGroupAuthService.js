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
    'DAO localGroupDAO',
    'DAO localSessionDAO',
    'DAO localUserDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.session.Session',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.Email',
    'foam.util.Password',
    'foam.util.SafetyUtil',

    'java.security.Permission',
    'java.util.Calendar',
    'javax.security.auth.AuthPermission',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
  ],

  constants: [
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
      name: 'getCurrentSubject',
      javaCode: `
        Session session = x.get(Session.class);
        // fetch context and check if not null or user id is 0
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException();
        }
        // get user from session id
        User user = (User) ((DAO) getLocalUserDAO()).find(session.getUserId());
        user.validateAuth(x);
        // check if group enabled
        Group group = getCurrentGroup(x);
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("Group disabled");
        }
        Subject subject = (Subject) x.get("subject");
        return subject;
      `
    },
    {
      name: 'loginHelper',
      documentation: `Helper function to reduce duplicated code.`,
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
      try {
        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check that the user is active
        assertUserIsActive(user);

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AccessDeniedException();
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AccessDeniedException();
        }

        // check if group enabled
        X userX = x.put("subject", new Subject.Builder(x).setUser(user).build());
        Group group = user.findGroup(userX);
        if ( group != null && ! group.getEnabled() ) {
          throw new AccessDeniedException();
        }

        if ( ! Password.verify(password, user.getPassword()) ) {
          throw new InvalidPasswordException();
        }

        try {
          group.validateCidrWhiteList(x);
        } catch (foam.core.ValidationException e) {
          throw new AccessDeniedException(e);
        }

        Session session = x.get(Session.class);

        // Re use the session context if the current session context's user id matches the id of the user trying to log in
        if ( session.getUserId() == user.getId() ) {
          return user;
        }

        // Freeze user
        user = (User) user.fclone();
        user.freeze();
        
        session.setUserId(user.getId());

        if ( check(userX, "*") ) {
          String msg = "Admin login for " + user.getId() + " succeeded on " + System.getProperty("hostname", "localhost");
          ((foam.nanos.logger.Logger) x.get("logger")).warning(msg);
        }

        ((DAO) getLocalSessionDAO()).inX(x).put(session);
        session.setContext(session.applyTo(session.getContext()));
        return user;
      } catch ( AuthenticationException e ) {
        if ( user != null &&
             ( check(x.put("subject", new Subject.Builder(x).setUser(user).build()), "*") ) ) {
          String msg = "Admin login for " + user.getId() + " failed on " + System.getProperty("hostname", "localhost");
          ((foam.nanos.logger.Logger) x.get("logger")).warning(msg);
        }
        throw e;
      }
      `
    },
    {
      name: 'login',
      documentation: `Login a user by their identifier (email or username) provided, validate the password and
        return the user in the context`,
      javaCode: `
        User user = (User) ((DAO) getLocalUserDAO())
          .inX(x)
          .find(
            AND(
              OR(
                EQ(User.EMAIL, identifier.toLowerCase()),
                EQ(User.USER_NAME, identifier)
              ),
              CLASS_OF(User.class)
            )
          );

        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }
        return loginHelper(x, user, password);
      `
    },
    {
      name: 'checkUser',
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
            if ( group.implies(x, new AuthPermission(permission)) ) return true;

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

        Permission p = new AuthPermission(permission);

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
        // Password policy to validate against
        PasswordPolicy passwordPolicy = null;

        // Retrieve the logger
        Logger logger = (Logger) x.get("logger");

        // Retrieve the password policy from theme.
        Theme theme = ((Themes) x.get("themes")).findTheme(x);
        passwordPolicy = theme.getPasswordPolicy();
        passwordPolicy.setX(x);

        // Use the default password policy if nothing is found
        if ( passwordPolicy == null || ! passwordPolicy.getEnabled() ) {
          passwordPolicy = new PasswordPolicy();
          passwordPolicy.setEnabled(true);
          passwordPolicy.setX(x);
        }

        // Validate the password against the password policy
        passwordPolicy.validate(user, potentialPassword);
      `
    },
    {
      name: 'assertUserIsActive',
      documentation: `Given a user, we check whether the user is ACTIVE.`,
      args: [
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
      // check that the user is active
      if ( user instanceof LifecycleAware && ((LifecycleAware)user).getLifecycleState() != LifecycleState.ACTIVE ) {
        throw new AuthenticationException("User is not active");
      }
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

        // check that the user is active
        assertUserIsActive(user);

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
        validatePassword(x, user, newPassword);

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
        Subject subject = new Subject.Builder(x).setUser(user).build();
        session.setContext(session.getContext().put("subject", subject).put("group", group));
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

        validatePassword(x, user, user.getPassword());
      `
    },
    {
      name: 'logout',
      documentation: `Just return a null user for now. Not sure how to handle
        the cleanup of the current context.`,
      javaCode: `
        Session session = x.get(Session.class);
        if ( session != null && session.getUserId() != 0 ) {
((foam.nanos.logger.Logger) x.get("logger")).info(this.getClass().getSimpleName(), "logout", session.getId());
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

        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();

        // Second highest precedence: If one user is acting as another, return the
        // group on the junction between them.
        if ( user != null ) {
          if ( agent != null && agent.getId() != user.getId() ) {
            DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
            UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(
              AND(
                EQ(UserUserJunction.SOURCE_ID, agent.getId()),
                EQ(UserUserJunction.TARGET_ID, user.getId())
              )
            );

            if ( junction == null ) {
              ((foam.nanos.logger.Logger) x.get("logger")).warning("There was a user and an agent in the context, but a junction between them was not found.", "user", user.getId(), "agent", agent.getId());
              throw new RuntimeException("There was a user and an agent in the context, but a junction between them was not found.");
            }

            return (Group) ((DAO) getLocalGroupDAO()).inX(x).find(junction.getGroup());
          }

          // Third highest precedence: If a user is logged in but not acting as
          // another user, return their group.
          return (Group) ((DAO) getLocalGroupDAO()).inX(x).find(user.getGroup());
        }

        // If none of the cases above match, return null.
        // TODO: Should this throw an error instead?
        return null;
      `
    }
  ]
});

