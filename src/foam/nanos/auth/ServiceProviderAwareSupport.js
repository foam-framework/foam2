/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareSupport',

  documentation: 'Support methods for ServiceProviderAware DAOs and Sinks.',

  // TODO: ServiceProviderAwareMLang(property) performs EQ on getSpid on both objs.
  // or add to generation where 'findFoo' is available.  then can just add property list,

  javaImports: [
    'foam.core.X',
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
      documentation: 'Using Relationship findFoo(x), traverse relationships for ServiceProviderAware entity.',
      name: 'find',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'properties',
          type: 'foam.core.PropertyInfo[]'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'foam.nanos.auth.ServiceProviderAware',
      javaCode: `
      Object result = obj;
      if ( result == null ||
           result != null &&
           result instanceof ServiceProviderAware ) {
        return (ServiceProviderAware) result;
      }

      for ( int i = 0; i < properties.length; i++) {
        foam.core.PropertyInfo pInfo = properties[i];
        try {
          java.lang.reflect.Method method = getFindMethod(x, pInfo.getName(), result);
          result = invokeMethod(x, method, result);
        } catch (Throwable e) {
          break;
        }
      }

      if ( result != null &&
           result instanceof ServiceProviderAware ) {
        return (ServiceProviderAware) result;
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
               cause instanceof foam.nanos.auth.AuthorizationException ) {
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
