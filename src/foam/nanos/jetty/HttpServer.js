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
    'org.eclipse.jetty.websocket.servlet.WebSocketCreator',
    'foam.nanos.logger.Logger',
    'java.util.Set',
    'java.util.HashSet',
    'java.util.Arrays',
    'org.eclipse.jetty.server.*',
    'org.eclipse.jetty.util.ssl.SslContextFactory',
    'java.io.FileInputStream',
    'java.security.KeyStore',
    'org.apache.commons.io.IOUtils'
  ],

  properties: [
    {
      class: 'Int',
      name: 'port',
      value: 8080
    },
    {
      class: 'Boolean',
      name: 'enableHttps'
    },
    {
      class: 'Int',
      name: 'httpsPort',
      value: 443
    },
    {
      class: 'String',
      name: 'keystorePath'
    },
    {
      class: 'String',
      name: 'keystorePassword'
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
      class: 'StringArray',
      name: 'forwardedForProxyWhitelist'
    },
    {
      class: 'StringArray',
      name: 'hostDomains',
      javaPreSet: `
        Arrays.sort(val);
      `
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
        int port = getPort();
        String portStr = System.getProperty("http.port");
        if ( portStr != null && ! portStr.isEmpty() ) {
          try {
            port = Integer.parseInt(portStr);
            setPort(port);
          } catch ( NumberFormatException e ) {
            System.err.println(this.getClass().getSimpleName()+" invalid http.port '"+portStr+"'");
            port = getPort();
          }
        }

        org.eclipse.jetty.server.Server server =
          new org.eclipse.jetty.server.Server(port);

        /*
          The following for loop will accomplish the following:
          1. Prevent Jetty server from broadcasting its version number in the HTTP
          response headers.
          2. Configure Jetty server to interpret the X-Fowarded-for header
        */
        
        // we are converting the ForwardedForProxyWhitelist array into a set here
        // so that it makes more sense algorithmically to check against IPs
        Set<String> forwardedForProxyWhitelist = new HashSet<>(Arrays.asList(getForwardedForProxyWhitelist()));

        for ( org.eclipse.jetty.server.Connector conn : server.getConnectors() ) {
          for ( org.eclipse.jetty.server.ConnectionFactory f : conn.getConnectionFactories() ) {
            if ( f instanceof org.eclipse.jetty.server.HttpConnectionFactory ) {
              
              // 1. hiding the version number in response headers
              ((org.eclipse.jetty.server.HttpConnectionFactory) f).getHttpConfiguration().setSendServerVersion(false);

              // 2. handle the X-Forwarded-For headers depending on whether a whitelist is set up or not
              // we need to pass the context into this customizer so that we can effectively log unauthorized proxies
              ((org.eclipse.jetty.server.HttpConnectionFactory) f).getHttpConfiguration().addCustomizer(new WhitelistedForwardedRequestCustomizer(getX(), forwardedForProxyWhitelist));
            }
          }
        }

        org.eclipse.jetty.servlet.ServletContextHandler handler =
          new org.eclipse.jetty.servlet.ServletContextHandler();

        String root = System.getProperty("nanos.webroot");
        if ( root == null ) {
          root = this.getClass().getResource("/webroot/index.html").toExternalForm();
          root = root.substring(0, root.lastIndexOf("/"));
        }

        handler.setResourceBase(root);
        handler.setWelcomeFiles(getWelcomeFiles());

        handler.setAttribute("X", getX());
        handler.setAttribute("httpServer", this);

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
                
        this.configHttps(server);
                
        server.start();
      } catch(Exception e) {
        Logger logger = (Logger) getX().get("logger");
        if ( logger != null )
          logger.error(e);
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
      javaCode: `
        Runtime.getRuntime().addShutdownHook(new Thread() {
          @Override
          public void run() {
            try {
              System.out.println("Shutting down Jetty server with the shutdown hook.");
              server.stop();
            } catch (Exception e) {
              System.err.println("Exception during Jetty server stop in the shutdown hook");
              Logger logger = (Logger) getX().get("logger");
              if ( logger != null )
                logger.error(e);
            }
          }
        });
      `
    },
    {
      name: 'configHttps',
      documentation: 'https://docs.google.com/document/d/1hXVdHjL8eASG2AG2F7lPwpO1VmcW2PHnAW7LuDC5xgA/edit?usp=sharing',
      args: [
        {
          name: 'server',
          javaType: 'final org.eclipse.jetty.server.Server'
        }
      ],
      javaCode: `
      foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");

      if ( this.getEnableHttps() ) {
  
        FileInputStream is = null;
        try {
          // 1. load the keystore to verify the keystore path and password.
          KeyStore keyStore = KeyStore.getInstance("JKS");
          is = new FileInputStream(this.getKeystorePath());
          keyStore.load(is, this.getKeystorePassword().toCharArray());
  
          // 2. enable https
          HttpConfiguration https = new HttpConfiguration();
          https.addCustomizer(new SecureRequestCustomizer());
          SslContextFactory sslContextFactory = new SslContextFactory();
          sslContextFactory.setKeyStorePath(this.getKeystorePath());
          sslContextFactory.setKeyStorePassword(this.getKeystorePassword());
  
          ServerConnector sslConnector = new ServerConnector(server,
            new SslConnectionFactory(sslContextFactory, "http/1.1"),
            new HttpConnectionFactory(https));
          sslConnector.setPort(this.getHttpsPort());
  
          server.addConnector(sslConnector);
  
        } catch ( java.io.FileNotFoundException e ) {
          logger.error("No KeyStore file found at path: " + this.getKeystorePath(), 
                       "Please see: https://docs.google.com/document/d/1hXVdHjL8eASG2AG2F7lPwpO1VmcW2PHnAW7LuDC5xgA/edit?usp=sharing", e);
        } catch ( java.io.IOException e ) {
          logger.error("Invalid KeyStore file password, please make sure you have set the correct password.",
                       "Please see: https://docs.google.com/document/d/1hXVdHjL8eASG2AG2F7lPwpO1VmcW2PHnAW7LuDC5xgA/edit?usp=sharing", e);
        } catch ( Exception e ) {
          logger.error("Error when enable the https.");
        } finally {
          IOUtils.closeQuietly(is);
        }
  
      }
      `
    },
    {
      name: 'containsHostDomain',
      type: 'Boolean',
      documentation: `Returns true if given domain is contained in server's host domains.`,
      args: [
        { name: 'domain', javaType: 'String' }
      ],
      javaCode: `
        return Arrays.binarySearch(getHostDomains(), domain) >= 0;
      `
    }
  ]
});
