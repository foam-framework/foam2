/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Enforce Spid to that of context user or AppConfig default on put,
and filter by spid on find and select`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.Map',
    'java.util.HashMap'
  ],

  properties: [
    {
      name: 'propertyInfos',
      class: 'Map',
      javaFactory: 'return new java.util.HashMap<String, PropertyInfo[]>();'
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
             ! ((AuthService) x.get("auth")).check(x, "spid.create."+sp.getSpid()) ) ) {
        User user = (User) x.get("user");
        if ( user != null &&
             ! SafetyUtil.isEmpty(user.getSpid()) ) {
          sp.setSpid(user.getSpid());
        } else {
          sp.setSpid(((AppConfig) x.get("appConfig")).getDefaultSpid());
        }
      }
    } else if ( ! sp.getSpid().equals(oldSp.getSpid()) &&
                ! (((AuthService) x.get("auth")).check(x, "spid.update."+oldSp.getSpid()) &&
                   ((AuthService) x.get("auth")).check(x, "spid.update."+sp.getSpid())) ) {
      throw new AuthorizationException("You do not have permission to update ServiceProvider (spid) property.");
    }

    return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
    FObject result = getDelegate().find_(x, id);
    if ( result == null ||
         ((AuthService) x.get("auth")).check(x, "*") ) {
      return result;
    }

    if ( new ServiceProviderAwareSupport().match(x, getPropertyInfos(), result) ) {
      return result;
    }

    return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
    if ( ((AuthService) x.get("auth")).check(x, "*") ) {
      return super.select_(x, sink, skip, limit, order, predicate);
    }

    ProxySink proxy = (ProxySink) getDelegate().select_(
      x,
      new ServiceProviderAwareSink(x, sink, getPropertyInfos()),
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
