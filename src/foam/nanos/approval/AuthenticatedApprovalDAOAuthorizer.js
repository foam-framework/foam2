/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'AuthenticatedApprovalDAOAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.*',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        if ( ! authService.check(x, "approval.create") ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null || ! SafetyUtil.equals(user.getId(), ((ApprovalRequest)obj).getApprover()) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        ApprovalRequest approvalRequest = (ApprovalRequest) oldObj;
        User user = (User) x.get("user");
        Long userId = ((User) x.get("user")).getId();
        AuthService authService = (AuthService) x.get("auth");
        if ( user == null || ! SafetyUtil.equals(approvalRequest.getApprover(), userId) && ! ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system"))) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null  || ! ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system")) ) {
          throw new AuthorizationException("Approval can only be deleted by system");
        }
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "approval.read.*");
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        return authService.check(x, "approval.remove.*");
      `
    }
  ]
})
