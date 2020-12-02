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
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
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
        User user = ((Subject) x.get("subject")).getRealUser();
        if ( user == null || ! SafetyUtil.equals(user.getId(), ((ApprovalRequest)obj).getApprover()) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        ApprovalRequest approvalRequest = (ApprovalRequest) oldObj;
        User user = ((Subject) x.get("subject")).getRealUser();
        AuthService authService = (AuthService) x.get("auth");
        if ( user == null || ! SafetyUtil.equals(approvalRequest.getApprover(), user.getId()) && ! ( user.getId() == foam.nanos.auth.User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system"))) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = ((Subject) x.get("subject")).getRealUser();
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
