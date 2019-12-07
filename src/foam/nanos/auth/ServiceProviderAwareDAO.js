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

  properties: [
    {
      name: 'referencePropertyInfos',
      class: 'FObjectArray',
      of: 'foam.core.PropertyInfo',
      javaFactory: 'return new foam.core.PropertyInfo[0];'
    }
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
    FObject result = super.find_(x, id);

    if ( ((AuthService) x.get("auth")).check(x, "*") ) {
      return result;
    }

    ServiceProviderAware sp = new ServiceProviderAwareSupport().find(x, getReferencePropertyInfos(), result);
    if ( sp == null ||
      ! sp.getSpid().equals(((User) x.get("user")).getSpid()) ) {
      return null;
    }

    return result;
      `
    },
    {
      name: 'select_',
      javaCode: `
    if ( ((AuthService) x.get("auth")).check(x, "*") ) {
      return super.select_(x, sink, skip, limit, order, predicate);
    }

    ProxySink proxy = (ProxySink) super.select_(
      x,
      new ServiceProviderAwareSink(x, sink, getReferencePropertyInfos()),
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
