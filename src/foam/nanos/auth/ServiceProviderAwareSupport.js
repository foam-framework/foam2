/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareSupport',

  documentation: 'Support methods for ServiceProviderAware DAOs and Sinks.',

  static: [
    {
      documentation: 'Using Relationship findFoo(x), traverse relationships for ServiceProviderAware entity.',
      name: 'findServiceProviderAware',
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
        String methodName = "find" + pInfo.getName().substring(0,1).toUpperCase() + pInfo.getName().substring(1);
        try {
          java.lang.reflect.Method method = result.getClass().getMethod(methodName, foam.core.X.class);
          result = method.invoke(result, x);
        } catch (Throwable e) {
          Throwable cause = e.getCause();
          while ( cause.getCause() != null ) {
            cause = cause.getCause();
          }
          if ( cause != null &&
               cause instanceof foam.nanos.auth.AuthorizationException ) {
            ((foam.nanos.logger.Logger) x.get("logger")).debug("ServiceProviderAwareSupport", "AuthorizationException", methodName, "on", result.getClass().getSimpleName(), e.getMessage(), e);
            return null;
          } else {
            ((foam.nanos.logger.Logger) x.get("logger")).error("ServiceProviderAwareSupport", "Failed to reflect/invoke method", methodName, "on", result.getClass().getSimpleName(), e.getMessage(), e);
          }
          break;
        }
      }

      if ( result != null &&
           result instanceof ServiceProviderAware ) {
        return (ServiceProviderAware) result;
      }
      return null;
      `
    }
  ]
});
