/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Enforce Spid to that of context user or AppConfig default.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaThrows: ['AuthorizationException'],
      javaCode: `
    if ( ! ( obj instanceof ServiceProviderAware ) ) {
      return super.put_(x, obj);
    }

    Object id = obj.getProperty("id");
    FObject oldObj = getDelegate().inX(x).find(id);
    boolean isCreate = id == null || oldObj == null;

    ServiceProviderAware sp = (ServiceProviderAware) obj;
    ServiceProviderAware oldSp = (ServiceProviderAware) oldObj;

    if ( isCreate ) {
      if ( SafetyUtil.isEmpty(sp.getSpid()) ||
           ( ! SafetyUtil.isEmpty(sp.getSpid()) &&
             ! ((AuthService) x.get("auth")).check(x, "spid.create.*") ) ) {
        User user = (User) x.get("user");
        if ( user != null &&
             ! SafetyUtil.isEmpty(user.getSpid()) ) {
          sp.setSpid(user.getSpid());
        } else {
          sp.setSpid(((AppConfig) x.get("appConfig")).getDefaultSpid());
        }
      }
    } else if ( ! sp.getSpid().equals(oldSp.getSpid()) &&
                ! ((AuthService) x.get("auth")).check(x, "spid.update.*") ) {
      throw new AuthorizationException("You do not have permission to update ServiceProvider (spid) property.");
    }

    return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
    FObject found = super.find_(x, id);
    if ( found != null ) {
      ServiceProviderAware sp = (ServiceProviderAware) found;
      User user = (User) x.get("user");
      if ( User.SYSTEM_USER_ID != user.getId() &&
           ! user.getSpid().equals(sp.getSpid()) ) {
System.out.println(this.getClass().getSimpleName() + " find_ " + user.getSpid() +" discard "+sp.getSpid()+" user "+user.getId());
        return null;
      }
    }
    return found;
      `
    },
    {
      name: 'select_',
      javaCode: `
    ProxySink proxy = (ProxySink) super.select_(
      x,
      new ServiceProviderAwareSink(x, sink),
      skip,
      limit,
      order,
      predicate
   );
    return proxy.getDelegate();
      `
    }
  ]
});
