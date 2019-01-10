/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'HttpServer',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'org.eclipse.jetty.http.pathmap.ServletPathSpec',
    'org.eclipse.jetty.websocket.server.WebSocketUpgradeFilter',
    'org.eclipse.jetty.websocket.servlet.ServletUpgradeRequest',
    'org.eclipse.jetty.websocket.servlet.ServletUpgradeResponse',
    'org.eclipse.jetty.websocket.servlet.WebSocketCreator'
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
      name: 'servletMappings',
      javaFactory: `return new foam.nanos.servlet.ServletMapping[0];`
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.servlet.ErrorPageMapping',
      name: 'errorMappings',
      javaFactory: `return new foam.nanos.servlet.ErrorPageMapping[0];`
    },
    {
      class: 'FObjectArray',
      name: 'filterMappings',
      of: 'foam.nanos.servlet.FilterMapping',
      javaFactory: 'return new foam.nanos.servlet.FilterMapping[0];'
    }
  ],
  methods: [
    {
      name: 'start',
      javaCode: `
      try {
        System.out.println("Starting Jetty http server.");
        org.eclipse.jetty.server.Server server =
          new org.eclipse.jetty.server.Server(getPort());

        /*
          Prevent Jetty server from broadcasting its version number in the HTTP
          response headers.
        */
        for ( org.eclipse.jetty.server.Connector conn : server.getConnectors() ) {
          for ( org.eclipse.jetty.server.ConnectionFactory f : conn.getConnectionFactories() ) {
            if ( f instanceof org.eclipse.jetty.server.HttpConnectionFactory ) {
              ((org.eclipse.jetty.server.HttpConnectionFactory) f).getHttpConfiguration().setSendServerVersion(false);
            }
          }
        }

        org.eclipse.jetty.servlet.ServletContextHandler handler =
          new org.eclipse.jetty.servlet.ServletContextHandler();

        handler.setResourceBase(System.getProperty("user.dir"));
        handler.setWelcomeFiles(getWelcomeFiles());

        handler.setAttribute("X", getX());

        for ( foam.nanos.servlet.ServletMapping mapping : getServletMappings() ) {
          org.eclipse.jetty.servlet.ServletHolder holder;

          if ( mapping.getServletObject() != null ) {
            holder = new org.eclipse.jetty.servlet.ServletHolder(mapping.getServletObject());
            handler.addServlet(holder, mapping.getPathSpec());
          } else {
            holder = handler.addServlet(
                (Class<? extends javax.servlet.Servlet>)Class.forName(mapping.getClassName()), mapping.getPathSpec());
          }

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

        for ( foam.nanos.servlet.FilterMapping mapping : getFilterMappings() ) {
          org.eclipse.jetty.servlet.FilterHolder holder =
            handler.addFilter(
              (Class<? extends javax.servlet.Filter>)Class.forName(mapping.getFilterClass()),
              mapping.getPathSpec(),
              java.util.EnumSet.of(javax.servlet.DispatcherType.REQUEST));

          java.util.Iterator iter = mapping.getInitParameters().keySet().iterator();

          while ( iter.hasNext() ) {
            String key = (String)iter.next();
            holder.setInitParameter(key, (String)mapping.getInitParameters().get(key));
          }
        }

        // set error handler
        handler.setErrorHandler(errorHandler);

        // Add websocket upgrade filter
        WebSocketUpgradeFilter wsFilter = WebSocketUpgradeFilter.configureContext(handler);
        // set idle time out to 10s
        wsFilter.getFactory().getPolicy().setIdleTimeout(10000);
        // add mapping
        wsFilter.addMapping(new ServletPathSpec("/service/*"), new WebSocketCreator() {
          @Override
          public Object createWebSocket(ServletUpgradeRequest req, ServletUpgradeResponse resp) {
            return new foam.nanos.ws.NanoWebSocket(getX());
          }
        });

        addJettyShutdownHook(server);
        server.setHandler(handler);
        server.start();
      } catch(Exception e) {
        e.printStackTrace();
      }
      `
    },
    {
      name: 'addJettyShutdownHook',
      documentation: `A shutdown hook in case of unexpected process termination
        (covers break/ctrl+C but not kill -9).`,
      args: [
        {
          name: 'server',
          javaType: 'final org.eclipse.jetty.server.Server'
        }
      ],
      javaType: 'void',
      javaCode: `
        Runtime.getRuntime().addShutdownHook(new Thread() {
          @Override
          public void run() {
            try {
              System.out.println("Shutting down Jetty server with the shutdown hook.");
              server.stop();
            } catch (Exception e) {
              System.err.println("Exception during Jetty server stop in the shutdown hook");
              e.printStackTrace();
            }
          }
        });
      `
    }
  ]
});
