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
- filters find and select by the 'owning' ServiceProvider ID (spid),
- enforces spid permissions on update and create,
- restricts or filters by spid on remove.
The DAO can act on models which explicitly implement ServiceProviderAware,
or where a Reference/Relationship model implements ServiceProviderAware.
Where the ServiceProviderAware is found through a Reference or Relationship,
the DAO uses a Map of class and PropertyInfos to traverse the Reference,
Relationship hierarchy.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.app.AppConfig',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      documentation: `A Map propertyInfo[] key on class name.  For some class,
the propertyInfos are the Reference or Relationship property from which to find
the next step in the hierachy on route the instance which implements
ServiceProviderAware`,
      name: 'propertyInfos',
      class: 'Map'
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
    AuthService auth = (AuthService) x.get("auth");

    if ( isCreate ) {
      if ( SafetyUtil.isEmpty(sp.getSpid()) ||
           ( ! SafetyUtil.isEmpty(sp.getSpid()) &&
             ! auth.check(x, "serviceprovider.create." + sp.getSpid()) ) ) {
        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null &&
             ! SafetyUtil.isEmpty(user.getSpid()) ) {
          sp.setSpid(user.getSpid());
        } else {
          sp.setSpid(((AppConfig) x.get("appConfig")).getDefaultSpid());
        }
      }
    } else if ( ! sp.getSpid().equals(oldSp.getSpid()) &&
                ! (auth.check(x, "serviceprovider.update." + oldSp.getSpid()) &&
                   auth.check(x, "serviceprovider.update." + sp.getSpid())) ) {
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

    Predicate spidPredicate = predicate;

    String spid = (String) x.get("spid");
    if ( spid != null ) { // spid may be null during account creation.
      if ( ServiceProviderAware.class.isAssignableFrom(getOf().getObjClass()) ) {

        PropertyInfo spidProperty = ((PropertyInfo) getOf().getAxiomByName("spid"));
        spidPredicate = MLang.OR(
          MLang.EQ(spidProperty, spid),
          new ServiceProviderAwarePredicate(x, null, getPropertyInfos())
        );

        if ( predicate != null ) {
          spidPredicate = MLang.AND(
            spidPredicate,
            predicate
          );
        }
      } else if ( getPropertyInfos() != null &&
                  getPropertyInfos().size() > 0 ) {
        spidPredicate = new ServiceProviderAwarePredicate(x, predicate, getPropertyInfos());
      }
    }

    return getDelegate().select_(
      x,
      sink,
      skip,
      limit,
      order,
      spidPredicate
    );
     `
    },
    {
      name: 'cmd_',
      documentation: 'Process ServiceProviderAwareSupport action which performs spid matching on "OBJ" in the context.',
      javaCode: `
        if ( obj instanceof ServiceProviderAwareSupport ) {
          return ((ServiceProviderAwareSupport) obj).match(x, getPropertyInfos(), x.get("OBJ"));
        }

        return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
