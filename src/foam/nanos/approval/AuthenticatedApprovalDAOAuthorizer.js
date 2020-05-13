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
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.*',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.ApprovalRequest',
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService authService = (AuthService) x.get("auth");
        Long userId = ((User) x.get("user")).getId();
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
        Long userId = ((User) x.get("user")).getId();
        AuthService authService = (AuthService) x.get("auth");
        if ( ! authService.check(x, "approval.update." + approvalRequest.getId()) && ! SafetyUtil.equals(approvalRequest.getApprover(), userId) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        AuthService authService = (AuthService) x.get("auth");
        if ( user == null  || ! authService.check(x, "approval.remove." + ((ApprovalRequest)obj).getId())) {
          throw new AuthorizationException();
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
