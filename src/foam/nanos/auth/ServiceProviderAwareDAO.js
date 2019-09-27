/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareDAO',
  extends: 'foam.nanos.auth.AuthorizationDAO',

  documentation: 'Enforce Spid to that of context or system user',

  javaImports: [
    'foam.core.FObject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'authorizer',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Authorizer',
      javaFactory: `
    return new AuthorizableAuthorizer("spid.update.*");
`
    },
    {
      name: 'defaultSpid',
      class: 'String',
      value: 'nanopay'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    if ( ! ( obj instanceof ServiceProviderAware ) ) {
      return super.put_(x, obj);
    }

    ServiceProviderAware sp = (ServiceProviderAware) obj;
    ServiceProviderAware oldSp = (ServiceProviderAware) getDelegate().inX(x).find(sp.getSpid());

    boolean isCreate = oldSp == null || SafetyUtil.isEmpty(sp.getSpid()) || SafetyUtil.isEmpty(oldSp.getSpid());

    if ( isCreate ) {
      User user = (User) x.get("user");
      if ( user != null &&
           ! SafetyUtil.isEmpty(user.getSpid()) ) {
        sp.setSpid(user.getSpid());
      } else {
        sp.setSpid(getDefaultSpid());
      }
    } else if ( ! oldSp.getSpid().equals(sp.getSpid()) ) {
      if ( ! ((AuthService) getAuth()).check(x, "spid.update.*") ) {
        throw new AuthorizationException("You do not have permission to update SPIDs.");
      }
    }

    return super.put_(x, obj);
      `
    }
  ]

});
