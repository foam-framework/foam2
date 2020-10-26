/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareSupport',

  documentation: `Support methods for ServiceProviderAware DAOs and Sinks.
Use: see ServiceProviderAwareTest
        DAO dao = (DAO) new ServiceProviderAwareDAO.Builder(x)
                            .setDelegate(delegate)
                            .setPropertyInfos(
                              new HashMap<String, PropertyInfo[]>() {{
                                put(NotificationSetting.class.getName(), new PropertyInfo[] { NotificationSetting.OWNER });
                              }}
                            )
                            .build();

`,

  // TODO: ServiceProviderAwareMLang(property) performs EQ on getSpid on both objs.
  // and add to generation where 'findFoo' is available to avoid reflection.,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',

    'java.lang.reflect.Method',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.Map.Entry'
  ],

  properties: [
    {
      name: 'findMethods',
      class: 'Map',
      visibility: 'HIDDEN',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'propertyInfos',
      class: 'Map',
      visibility: 'HIDDEN',
      javaFactory: 'return new HashMap();'
    },
    {
      class: 'String',
      name: 'spid',
      documentation: 'The spid to be matched against. If not set, the context user spid will be used.'
    }
  ],

  methods: [
    {
      documentation: `Using Relationship findFoo(x), traverse relationships,
returning true if the spid or context users spid matches the current object.`,
      name: 'match',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'properties',
          type: 'Map'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'Boolean',
      javaCode: `
      var isUserSpid = false;
      var spid = getSpid();

      if ( SafetyUtil.isEmpty(spid) ) {
        var user = ((Subject) x.get("subject")).getUser();
        if ( user == null ) {
          // TODO/REVIEW: occurs during login. See AuthenticationApiTest
          return true;
        }
        spid = user.getSpid();
        isUserSpid = true;
      }

      var auth = (AuthService) x.get("auth");

      if ( obj != null &&
           obj instanceof ServiceProviderAware ) {
        ServiceProviderAware sp = (ServiceProviderAware) obj;
        return sp.getSpid().startsWith(spid) ||
                 isUserSpid && auth.check(x, getSpidReadPermission(sp.getSpid()));
      }

      Object result = obj;
      while ( result != null &&
              properties != null ) {
        PropertyInfo pInfos[] = (PropertyInfo[]) getProperties(x, properties, result);
        if ( pInfos == null ) {
          return false;
        }
        for ( int i = 0; i < pInfos.length; i++ ) {
          foam.core.PropertyInfo pInfo = pInfos[i];
          try {
            Method method = (Method) getFindMethods().get(pInfo.getName());
            if ( method == null ) {
              method = getFindMethod(x, pInfo.getName(), result);
            }
            result = invokeMethod(x, method, result);
            if ( result != null &&
                 result instanceof ServiceProviderAware ) {
              ServiceProviderAware sp = (ServiceProviderAware) result;
              return sp.getSpid().startsWith(spid) ||
                       isUserSpid && auth.check(x, getSpidReadPermission(sp.getSpid()));
            } else {
              break;
            }
          } catch (NoSuchMethodException e) {
            ((Logger) x.get("logger")).warning("ServiceProviderAwareSupport.match", result.getClass().getSimpleName(), pInfo.getName(), "NoSuchMethodException");
            return false;
          }
        }
      }
      return false;
     `
    },
    {
      documentation: `Search for obj class name in property info map.
If not found, test if argument obj is assignable from map class, and
store the result for subsequent lookups. `,
      name: 'getProperties',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'properties',
          type: 'Map'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'foam.core.PropertyInfo[]',
      javaCode: `
      String name = obj.getClass().getName();
      PropertyInfo[] pInfos = (PropertyInfo[]) getPropertyInfos().get(name);
      if ( pInfos != null ) {
        return pInfos;
      }

      for ( Object o : properties.entrySet() ) {
        Map.Entry entry = (Map.Entry) o;
        String key = entry.getKey().toString();
        try {
          Class cls = Class.forName(key);
          if ( cls.isAssignableFrom(obj.getClass()) ) {
           getPropertyInfos().put(name, entry.getValue());
            return (PropertyInfo[]) entry.getValue();
          }
        } catch ( ClassNotFoundException e ) {
          getPropertyInfos().put(name, new PropertyInfo[0]);
          break;
        }
      }
      return null;
     `
    },
    {
      name: 'getFindMethod',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'java.lang.reflect.Method',
      javaThrows: ['NoSuchMethodException'],
      javaCode: `
    Method method = (Method) getFindMethods().get(name);
    if ( method == null ) {
      String methodName = "find" + name.substring(0,1).toUpperCase() + name.substring(1);
      method = obj.getClass().getMethod(methodName, X.class);
      getFindMethods().put(name, method);
    }
    return method;
     `
    },
    {
      name: 'invokeMethod',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'method',
          type: 'java.lang.reflect.Method'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'Object',
      javaCode: `
        try {
          return method.invoke(obj, x);
        } catch (Throwable e) {
          Throwable cause = e.getCause();
          while ( cause.getCause() != null ) {
            cause = cause.getCause();
          }
          if ( cause != null &&
               cause instanceof AuthorizationException ) {
            ((Logger) x.get("logger")).debug("ServiceProviderAwareSupport.invokeMethod", obj.getClass().getSimpleName(), method.getName(), "AuthorizationException", cause.getMessage(), cause);
            return null;
          } else {
            ((Logger) x.get("logger")).error("ServiceProviderAwareSupport.invokeMethod", obj.getClass().getSimpleName(), method.getName(), e.getMessage(), e);
          }
        }
        return null;
      `
    },
    {
      name: 'getSpidReadPermission',
      type: 'String',
      args: [
        { name: 'spid', type: 'String' }
      ],
      javaCode: `
        return "serviceprovider.read." + (SafetyUtil.isEmpty(spid) ? "*" : spid);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ServiceProviderAwareSupport(String spid) {
            setSpid(spid);
          }
        `);
      }
    }
  ]
});
