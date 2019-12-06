foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareSupport',

  static: [
    {
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
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      foam.core.FObject result = obj;
      if ( result == null ||
           result != null &&
           result instanceof ServiceProviderAware ) {
        return result;
      }
      for ( int i = 0; i < properties.length; i++) {
        foam.core.PropertyInfo pInfo = properties[i];
        String methodName = "find" + pInfo.getName().substring(0,1).toUpperCase() + pInfo.getName().substring(1);
        try {
          java.lang.reflect.Method method = result.getClass().getMethod(methodName, foam.core.X.class);
          result = (foam.core.FObject) method.invoke(result, x);
        } catch (Exception e) {
          ((foam.nanos.logger.Logger) x.get("logger")).error("ServiceProviderAwareSupport", "Failed to reflect/invoke method", methodName, "on", result.getClass().getSimpleName(), e);
          break;
        }
      }
      if ( result != null &&
           result instanceof ServiceProviderAware ) {
        return result;
      }
      return null;
      `
    }
  ]
});
