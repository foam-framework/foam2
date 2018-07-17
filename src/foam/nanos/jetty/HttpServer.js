foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'HttpServer',
  implements: [
    'foam.nanos.NanoService'
  ],
  properties: [
    {
      class: 'Int',
      name: 'port',
      value: 8080
    },
    {
      class: 'StringArray',
      name: 'welcomeFiles',
      factory: function() {
        return [
          '/src/foam/nanos/controller/index.html'
        ];
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.servlet.ServletMapping',
      name: 'servletMappings'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.servlet.ErrorPageMapping',
      name: 'errorMappings'
    },
  ],
  methods: [
    {
      name: 'start',
      javaCode: `
      try {
        System.out.println("Starting jetty http server.");
        org.eclipse.jetty.server.Server server =
          new org.eclipse.jetty.server.Server(getPort());

        org.eclipse.jetty.servlet.ServletContextHandler handler =
          new org.eclipse.jetty.servlet.ServletContextHandler();

        handler.setResourceBase(System.getProperty("user.dir"));
        handler.setWelcomeFiles(getWelcomeFiles());

        handler.setAttribute("X", getX());

        for ( foam.nanos.servlet.ServletMapping mapping : getServletMappings() ) {
          org.eclipse.jetty.servlet.ServletHolder holder =
            handler.addServlet(
              (Class<? extends javax.servlet.Servlet>)Class.forName(mapping.getClassName()), mapping.getPathSpec());

          java.util.Iterator iter = mapping.getInitParameters().keySet().iterator();

          while ( iter.hasNext() ) {
            String key = (String)iter.next();
            holder.setInitParameter(key, ((String)mapping.getInitParameters().get(key)));
          }
        }

        org.eclipse.jetty.servlet.ErrorPageErrorHandler errorHandler =
          new org.eclipse.jetty.servlet.ErrorPageErrorHandler();

        for ( foam.nanos.servlet.ErrorPageMapping errorMapping : getErrorMappings() ) {
          if ( errorMapping.getErrorCode() != 0 ) {
            errorHandler.addErrorPage(errorMapping.getErrorCode(), errorMapping.getLocation());
          } else {
            errorHandler.addErrorPage((Class<? extends java.lang.Throwable>)Class.forName(errorMapping.getExceptionType()), errorMapping.getLocation());
          }
        }

        handler.setErrorHandler(errorHandler);
        server.setHandler(handler);
        
        server.start();
      } catch(Exception e) {
        e.printStackTrace();
      }
      `
    }
  ]
});
