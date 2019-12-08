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
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.core.FObject',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'findMethods',
      class: 'Map',
      visibility: 'HIDDEN',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      documentation: `Using Relationship findFoo(x), traverse relationships,
returning true if the context users spid matches the current object.`,
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
      User user = (User) x.get("user");
      if ( user == null ) {
        // TODO/REVIEW: occurs during login. See AuthenticationApiTest
        return true;
      }

      if ( obj != null &&
           obj instanceof ServiceProviderAware ) {
        return ((ServiceProviderAware) obj).getSpid().equals(user.getSpid());
      }

      Object result = obj;
      while ( result != null ) {
        PropertyInfo pInfos[] = (PropertyInfo[]) properties.get(result.getClass().getName());
        if ( pInfos == null ) {
          return false;
        }
        for ( int i = 0; i < pInfos.length; i++) {
          foam.core.PropertyInfo pInfo = pInfos[i];
          try {
            java.lang.reflect.Method method = getFindMethod(x, pInfo.getName(), result);
            result = invokeMethod(x, method, result);
            if ( result != null &&
                 result instanceof ServiceProviderAware ) {
              return ((ServiceProviderAware) result).getSpid().equals(user.getSpid());
            }
          } catch (Throwable e) {
            return false;
          }
        }
      }
      return false;
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
      javaThrows: ['Exception'],
      javaCode: `
    java.lang.reflect.Method method = (java.lang.reflect.Method) getFindMethods().get(name);
    if ( method == null ) {
      String methodName = "find" + name.substring(0,1).toUpperCase() + name.substring(1);
      try {
        method = obj.getClass().getMethod(methodName, foam.core.X.class);
        getFindMethods().put(name, method);
      } catch (Exception e) {
       ((Logger) x.get("logger")).error("ServiceProviderAwareSupport", "Failed to find method", methodName, "on", obj.getClass().getSimpleName(), e.getMessage(), e);
        throw e;
      }
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
            ((Logger) x.get("logger")).debug("ServiceProviderAwareSupport", "AuthorizationException", method.getName(), "on", obj.getClass().getSimpleName(), cause.getMessage(), cause);
            return null;
          } else {
            ((Logger) x.get("logger")).error("ServiceProviderAwareSupport", "Failed to invoke method", method.getName(), "on", obj.getClass().getSimpleName(), e.getMessage(), e);
          }
        }
        return null;
      `
    }
  ]
});
