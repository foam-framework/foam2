/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A DAO decorator which:
- enforces spid permissions on update and create,
- filters find, remove, and select by spids the caller has read permission on.
`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.stream.Collectors',
  ],

  properties: [
    {
      name: 'propertyInfo',
      class: 'Object',
      of: 'foam.core.PropertyInfo',
      javaFactory: `
      return (PropertyInfo) getOf().getAxiomByName("spid");
      `
    },
  ],

  methods: [
    {
      name: 'getPredicate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.mlang.predicate.Predicate',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      AuthService auth = (AuthService) x.get("auth");
      ArrayList<ServiceProvider> serviceProviders = (ArrayList) ((ArraySink) ((DAO) getX().get("localServiceProviderDAO")).select(new ArraySink())).getArray();
logger.info(this.getClass().getSimpleName(), "serviceproviders found", serviceProviders.size());
      List<String> ids = serviceProviders.stream()
                            .map(ServiceProvider::getId)
                            .filter(id -> auth.check(x, "serviceprovider.read."+id))
                            .collect(Collectors.toList());
      String spid = (String) x.get("spid");
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        User user = subject.getUser();
        if ( user != null &&
             ! SafetyUtil.isEmpty(user.getSpid()) ) {
          spid = user.getSpid();
        }
      }
logger.info(this.getClass().getSimpleName(), "serviceproviders read", ids.size(), getPropertyInfo(), spid);
      if ( ids.size() == 1 ) {
        return MLang.EQ(getPropertyInfo(), ids.get(0));
      } else if ( ids.size() > 1 ) {
        return MLang.IN(getPropertyInfo(), ids.toArray(new String[0]));
      }
      logger.error(this.getClass().getSimpleName(), "Permission denied");
      throw new AuthorizationException();
      `
    },
    {
      name: 'getSpid',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        User user = subject.getUser();
        if ( user != null &&
             ! SafetyUtil.isEmpty(user.getSpid()) ) {
          return user.getSpid();
        }
      }
      String spid = (String) x.get("spid");
      if ( ! SafetyUtil.isEmpty(spid) ) {
       return spid;
      }
      Theme theme = ((Themes) x.get("themes")).findTheme(x);
      if ( theme != null &&
           ! SafetyUtil.isEmpty(theme.getSpid()) ) {
        return theme.getSpid();
      }
      return ((AppConfig) x.get("appConfig")).getDefaultSpid();
      `
    },
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
      AuthService auth = (AuthService) x.get("auth");

      if ( isCreate ) {
        sp.setSpid(getSpid(x));
      } else if ( ! sp.getSpid().equals(oldSp.getSpid()) &&
                  ! (auth.check(x, "serviceprovider.update." + oldSp.getSpid()) &&
                     auth.check(x, "serviceprovider.update." + sp.getSpid())) ) {
        throw new AuthorizationException("You do not have permission to update ServiceProvider (spid) property.");
      } else if ( sp.getSpid().equals(oldSp.getSpid()) &&
                  ! auth.check(x, "serviceprovider.read." + sp.getSpid()) ) {
        throw new AuthorizationException();
      }

      return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
      if ( ((AuthService) x.get("auth")).check(x, "serviceprovider.read."+ServiceProviderAware.GLOBAL_SPID) ) {
        return getDelegate().find_(x, id);
      }
      return getDelegate().where(getPredicate(x)).find_(x, id);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      if ( ((AuthService) x.get("auth")).check(x, "serviceprovider.delete."+ServiceProviderAware.GLOBAL_SPID) ||
           ((AuthService) x.get("auth")).check(x, "serviceprovider.delete."+((ServiceProviderAware) obj).getSpid()) ) {
        return getDelegate().remove_(x, obj);
      }
      throw new AuthorizationException();
      `
    },
    {
      name: 'select_',
      javaCode: `
      if ( ((AuthService) x.get("auth")).check(x, "serviceprovider.read."+ServiceProviderAware.GLOBAL_SPID) ) {
        return super.select_(x, sink, skip, limit, order, predicate);
      }

      Predicate spidPredicate = getPredicate(x);
      if ( predicate != null ) {
        spidPredicate = MLang.AND(
          spidPredicate,
          predicate
        );
      }

      return getDelegate().select_(x, sink, skip, limit, order, spidPredicate);
      `
    }
  ]
});
