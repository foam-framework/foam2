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
    'foam.nanos.session.Session',
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
      AuthService auth = (AuthService) x.get("auth");
      ArrayList<ServiceProvider> serviceProviders = (ArrayList) ((ArraySink) ((DAO) getX().get("localServiceProviderDAO")).select(new ArraySink())).getArray();
      List<String> ids = serviceProviders.stream()
                            .map(ServiceProvider::getId)
                            .filter(id -> auth.check(x, "serviceprovider.read."+id))
                            .collect(Collectors.toList());
      if ( ids.size() == 1 ) {
        return MLang.EQ(getPropertyInfo(), ids.get(0));
      } else if ( ids.size() > 1 ) {
        return MLang.IN(getPropertyInfo(), ids.toArray(new String[0]));
      }
      throw new AuthorizationException();
      `
    },
    {
      description: `Return true if system/admin context`,
      name: 'isAdmin',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        User user = subject.getRealUser();
        if ( user != null ) {
          return user.isAdmin();
        }
      }
      return false;
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
      javaThrows: ['AuthorizationException'],
      javaCode: `
      User user = null;
      String spid = (String) x.get("spid");
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        user = subject.getUser();
        if ( user != null ) {
          if ( ! SafetyUtil.isEmpty(user.getSpid()) ) {
             spid = user.getSpid();
          }
        }
      }
      if ( SafetyUtil.isEmpty(spid) ||
           user != null &&
           user.isAdmin() &&
           SafetyUtil.isEmpty(user.getSpid()) ) {
        Theme theme = ((Themes) x.get("themes")).findTheme(x);
        if ( theme != null &&
             ! SafetyUtil.isEmpty(theme.getSpid()) ) {
          spid = theme.getSpid();
        } else {
          ((foam.nanos.logger.Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "Theme not found", ( theme != null ? theme.getId()+":"+theme.getName() : "null"));
        }
      }
      if ( SafetyUtil.isEmpty(spid) ) {
        throw new AuthorizationException();
      }
      return spid;
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
        if ( SafetyUtil.isEmpty(sp.getSpid()) ) {
          sp.setSpid(getSpid(x));
        } else if ( ! auth.check(x, "serviceprovider.read." + sp.getSpid()) ) {
          throw new AuthorizationException();
        }
      } else if ( ! sp.getSpid().equals(oldSp.getSpid()) &&
                  ! (auth.check(x, "serviceprovider.update." + oldSp.getSpid()) &&
                     auth.check(x, "serviceprovider.update." + sp.getSpid())) ) {
        throw new AuthorizationException();
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
      if ( isAdmin(x) ) {
        return getDelegate().find_(x, id);
      }

      return getDelegate().where(getPredicate(x)).find_(x, id);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      if ( isAdmin(x) ||
           getPredicate(x).f(obj) ) {
        return getDelegate().remove_(x, obj);
      }

      throw new AuthorizationException();
      `
    },
    {
      name: 'select_',
      javaCode: `
      Predicate spidPredicate = predicate;
      if ( ! isAdmin(x) ) {
        try {
          spidPredicate = getPredicate(x);
        } catch ( AuthorizationException e ) {
          // NOTE: On Login, context is empty of subject and spid
          Subject subject = (Subject) x.get("subject");
          if ( ( subject == null ||
                 subject.getRealUser() == null ) &&
               x.get("spid") == null ) {
            spidPredicate = null;
            ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "select", "login", "spid restrictions disabled.");
          } else {
            throw e;
          }
        }
        if ( predicate != null &&
             spidPredicate != null ) {
          spidPredicate = MLang.AND(
            spidPredicate,
            predicate
          );
        } else if ( spidPredicate == null ) {
          spidPredicate = predicate;
        }
      }
      return getDelegate().select_(x, sink, skip, limit, order, spidPredicate);
      `
    }
  ]
});
