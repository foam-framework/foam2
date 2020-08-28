/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'VirtualHostRoutingServlet',

  implements: [
    'foam.nanos.servlet.Servlet'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.jetty.HttpServer',
    'foam.nanos.logger.Logger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'java.io.IOException',
    'java.io.PrintWriter',
    'java.util.HashMap',
    'javax.servlet.ServletConfig',
    'javax.servlet.ServletException',
    'javax.servlet.ServletRequest',
    'javax.servlet.ServletResponse'
  ],

  properties: [
    {
      class: 'Map',
      name: 'customHostMapping',
      documentation: `Custom host mapping that will directly serve the index file for the specified virtual host.`
    },
    {
      class: 'Boolean',
      name: 'liveScriptBundlerDisabled',
      documentation: `If set to true, generate index file with live script bundler disabled.`,
      value: false
    },
    {
      class: 'Boolean',
      name: 'isResourceStorage',
      documentation: `If set to true, generate index file from jar file resources.`,
      value: false
    },
    {
      class: 'String',
      name: 'defaultHost'
    },
    {
      class: 'Object',
      transient: true,
      javaType: 'ServletConfig',
      name: 'servletConfig'
    }
  ],
  methods: [
    {
      name: 'destroy',
      type: 'Void',
      javaCode: '//noop'
    },
    {
      name: 'getServletInfo',
      type: 'String',
      javaCode: 'return "VirtualHostRoutingServlet";'
    },
    {
      name: 'init',
      type: 'Void',
      args: [ { name: 'config', javaType: 'ServletConfig' } ],
      javaCode: 'setServletConfig(config);',
      code: function() { }
    },
    {
      name: 'populateHead',
      type: 'Void',
      documentation: `Generates the index file's head content based on theme and prints it to the response writer.`,
      args: [ 
        { name: 'x', javaType: 'X'},
        { name: 'theme', javaType: 'Theme'},
        { name: 'logger', javaType: 'Logger'},
        { name: 'out', javaType: 'PrintWriter'}
      ],
      javaCode: `
      HashMap    headConfig          = (HashMap)   theme.getHeadConfig();
      AppConfig  appConfig           = (AppConfig) x.get("appConfig");
      Boolean    customFavIconFailed = false;
      Boolean    customScriptsFailed = false;
      Boolean    customFontsFailed   = false;

      out.println("<meta charset=\\"utf-8\\"/>");
      out.print("<title>");
      out.print(theme.getAppName());
      out.println("</title>");

      // custom favicon
      if ( headConfig != null && headConfig.containsKey("customFavIcon") ) {
        try {
          String[] favIconTags = (String[]) headConfig.get("customFavIcon");
          for ( String tag : favIconTags ) {
            out.println(tag);
          }
        }
        catch ( Exception e ) {
          logger.error(e);
          customFavIconFailed = true;
        }
      }
      // default favicon
      if ( headConfig == null || ! headConfig.containsKey("customFavIcon") || customFavIconFailed ) {
        out.println("<link rel=\\"apple-touch-icon\\" sizes=\\"180x180\\" href=\\"/favicon/apple-touch-icon.png\\">");
        out.println("<link rel=\\"icon\\" type=\\"image/png\\" sizes=\\"32x32\\" href=\\"/favicon/favicon-32x32.png\\">");
        out.println("<link rel=\\"icon\\" type=\\"image/png\\" sizes=\\"16x16\\" href=\\"/favicon/favicon-16x16.png\\">");
        out.println("<link rel=\\"manifest\\" href=\\"/favicon/manifest.json\\">");
        out.println("<link rel=\\"mask-icon\\" href=\\"/favicon/safari-pinned-tab.svg\\" color=\\"#5bbad5\\">");
        out.println("<link rel=\\"shortcut icon\\" href=\\"/favicon/favicon.ico\\">");
        out.println("<meta name=\\"msapplication-config\\" content=\\"/favicon/browserconfig.xml\\">");
        out.println("<meta name=\\"theme-color\\" content=\\"#ffffff\\">");
      }

      // custom scripts
      if ( headConfig != null && headConfig.containsKey("customScripts") ) {
        try {
          String[] scriptTags = (String[]) headConfig.get("customScripts");
          for ( String tag : scriptTags ) {
            out.println(tag);
          }
        }
        catch ( Exception e ) {
          logger.error(e);
          customScriptsFailed = true;
        }
      }
      // default scripts
      if ( headConfig == null || ! headConfig.containsKey("customScripts") || customScriptsFailed ) {
        // jar file deployment
        if ( this.getIsResourceStorage() ) {
          out.print("<script language=\\"javascript\\" src=\\"/foam-bin-");
          out.print(appConfig.getVersion());
          out.println(".js\\"></script>");
          out.println("<script async defer language=\\"javascript\\" src=\\"/html2canvas.min.js\\"></script>");
          out.println("<script async defer language=\\"javascript\\" src=\\"/jspdf.min.js\\"></script>");
          out.println("<script language=\\"javascript\\" src=\\"/jspdf.plugin.autotable.min.js\\"></script>");
          out.println("<script async defer language=\\"JavaScript\\" src=\\"https://cdn.plaid.com/link/v2/stable/link-initialize.js\\"></script>");
        }
        // development
        else {
          if ( this.getLiveScriptBundlerDisabled() ) {
            out.println("<script language=\\"javascript\\" src=\\"../../../../foam2/src/foam.js\\"></script>");
            out.println("<script language=\\"javascript\\" src=\\"../../../../foam2/src/foam/nanos/nanos.js\\"></script>");
            out.println("<script language=\\"javascript\\" src=\\"../../../../foam2/src/foam/support/support.js\\"></script>");
            out.println("<script language=\\"javascript\\" src=\\"../../../../nanopay/src/net/nanopay/files.js\\"></script>");
            out.println("<script language=\\"javascript\\" src=\\"../../../../nanopay/src/net/nanopay/iso20022/files.js\\"></script>");
            out.println("<script language=\\"javascript\\" src=\\"../../../../nanopay/src/net/nanopay/iso8583/files.js\\"></script>");
            out.println("<script language=\\"javascript\\" src=\\"../../../../nanopay/src/net/nanopay/flinks/utils/files.js\\"></script>");
          }
          else {
            out.println("<script language=\\"javascript\\" src=\\"/service/liveScriptBundler\\"></script>");
          }
          out.println("<script async defer language=\\"JavaScript\\" src=\\"https://cdn.plaid.com/link/v2/stable/link-initialize.js\\"></script>");
          out.println("<script async defer language=\\"javascript\\" src=\\"../../../../node_modules/html2canvas/dist/html2canvas.min.js\\"></script>");
          out.println("<script language=\\"javascript\\" src=\\"../../../../node_modules/jspdf/dist/jspdf.min.js\\"></script>");
          out.println("<script async defer language=\\"javascript\\" src=\\"../../../../node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js\\"></script>");
        }
      }

      // custom fonts
      if ( headConfig != null && headConfig.containsKey("customFonts") ) {
        try {
          String[] fontTags = (String[]) headConfig.get("customFonts");
          for ( String tag : fontTags ) {
            out.println(tag);
          } 
        }
        catch ( Exception e ) {
          logger.error(e);
          customFontsFailed = true;
        }
      }
      // default fonts
      if ( headConfig == null || ! headConfig.containsKey("customFonts") || customFontsFailed ) {
        out.println("<link href=\\"https://fonts.googleapis.com/css?family=Roboto:100,300,400,500\\" rel=\\"stylesheet\\">");
        out.println("<link href=\\"https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i,900,900i\\" rel=\\"stylesheet\\">");
        out.println("<link href=\\"https://fonts.googleapis.com/css?family=IBM+Plex+Sans&display=swap\\" rel=\\"stylesheet\\">");
      }
      `
    },
    {
      name: 'service',
      type: 'Void',
      args: [ { name: 'request', javaType: 'ServletRequest' },
              { name: 'response', javaType: 'ServletResponse' } ],
      javaThrows: [ 'ServletException', 'IOException' ],
      javaCode: `
        String vhost = request.getServerName();
        
        if ( getCustomHostMapping().containsKey(vhost) ) {
          request.getRequestDispatcher((String) getCustomHostMapping().get(vhost)).forward(request, response);
          return;
        }

        HttpServer server         = (HttpServer) this.getServletConfig().getServletContext().getAttribute("httpServer");
        X          x              = (X)          this.getServletConfig().getServletContext().getAttribute("X");
        DAO        themeDomainDAO = (DAO)        x.get("themeDomainDAO");
        DAO        themeDAO       = (DAO)        x.get("themeDAO");
        Logger     logger         = (Logger)     x.get("logger");

        if ( ! server.containsHostDomain(vhost) ) {
          vhost = getDefaultHost();
        }

        ThemeDomain themeDomain = (ThemeDomain) themeDomainDAO.find(vhost);
        if ( themeDomain == null ) {
          themeDomain = (ThemeDomain) themeDomainDAO.find(getDefaultHost());
          if ( themeDomain == null ) {
            themeDomain = (ThemeDomain) themeDomainDAO.find("localhost");
            logger.warning("No theme domain found for default host " + getDefaultHost()+". Falling back to localhost");
          }
        }

        Theme theme = (Theme) themeDAO.find(themeDomain.getTheme());
        if ( theme == null ) {
          throw new RuntimeException("No theme found for theme domain " + themeDomain.getId());
        }

        response.setContentType("text/html; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.println("<!DOCTYPE>");

        out.println("<html lang=\\"en\\">");
        out.println("<head>");

        this.populateHead(x, theme, logger, out);

        out.println("</head>");
        out.println("<body>");

        out.println("<!-- Instantiate FOAM Application Controller -->");
        out.println("<!-- App Color Scheme, Logo, & Web App Name -->");
        out.print("<foam\\nclass=\\"net.nanopay.ui.Controller\\"\\nid=\\"ctrl\\"\\nwebApp=\\"");
        out.print(theme.getAppName());
        out.println("\\">\\n</foam>");

        out.println("</body>");
        out.println("</html>");
      `
    }
  ]
});
