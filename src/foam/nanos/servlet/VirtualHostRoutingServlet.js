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
    'foam.nanos.jetty.HttpServer',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'java.io.IOException',
    'java.io.PrintWriter',
    'java.lang.StringBuilder',
    'javax.servlet.ServletConfig',
    'javax.servlet.ServletException',
    'javax.servlet.ServletRequest',
    'javax.servlet.ServletResponse',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.Iterator',
    'java.util.Map.Entry'
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
      name: 'getTagString',
      type: 'String',
      documentation: `Utility method that returns an html tag string.`,
      args: [ 
        { name: 'tag', javaType: 'String'},
        { name: 'keywords', javaType: 'ArrayList<String>'},
        { name: 'attributes', javaType: 'HashMap'},
        { name: 'hasClosingTag', javaType: 'Boolean'},
        { name: 'isSingleClosingTag', javaType: 'Boolean'}
      ],
      javaCode: `
        StringBuilder sb = new StringBuilder("<");
        sb.append(tag);
        sb.append(" ");
        for ( String keyword : keywords ) {
          sb.append(keyword);
          sb.append(" ");
        }
        Iterator i = attributes.entrySet().iterator();
        while ( i.hasNext() ) {
          Entry attribute = (Entry) i.next();
          sb.append(attribute.getKey());
          sb.append("=\\"");
          sb.append(attribute.getValue());
          sb.append("\\" ");
          i.remove();
        }
        if ( isSingleClosingTag ) {
          sb.append("/>");
          return sb.toString();
        }
        sb.append(">");
        if ( hasClosingTag ) {
          sb.append("</");
          sb.append(tag);
          sb.append(">");
        }
        return sb.toString();
      `
    },
    {
      name: 'populateHead',
      type: 'Void',
      documentation: `Generates the index file's head content based on theme and prints it to the response writer.`,
      args: [ 
        { name: 'theme', javaType: 'Theme'},
        { name: 'out', javaType: 'PrintWriter'} 
      ],
      javaCode: `
      ArrayList<HashMap> headConfig = (ArrayList<HashMap>) theme.getHeadConfig();

      out.println("<meta charset=\\"utf-8\\"/>");
      out.println("<title>" + theme.getAppName() + "</title>");
      for ( int i = 0; i < headConfig.size(); i++ ) {
        HashMap tagConfig = (HashMap) headConfig.get(i);

        ArrayList<String> keywords  = new ArrayList<String>();
        if ( tagConfig.containsKey("keywords") ) {
          keywords = (ArrayList<String>) tagConfig.get("keywords");
        }

        Boolean hasClosingTag = false;
        if ( tagConfig.containsKey("hasClosingTag") ) {
          hasClosingTag = (Boolean) tagConfig.get("hasClosingTag");
        }

        Boolean isSingleClosingTag = false;
        if ( tagConfig.containsKey("isSingleClosingTag") ) {
          isSingleClosingTag = (Boolean) tagConfig.get("isSingleClosingTag");
        }

        String headTag = this.getTagString((String) tagConfig.get("tag"), keywords, (HashMap) tagConfig.get("attributes"), hasClosingTag, isSingleClosingTag);
        out.println(headTag);
      }
      
      if ( this.getIsResourceStorage() ) {
        out.println("<script language=\\"javascript\\" src=\\"/foam-bin-@VERSION@.js\\"></script>");
        out.println("<script async defer language=\\"javascript\\" src=\\"/html2canvas.min.js\\"></script>");
        out.println("<script async defer language=\\"javascript\\" src=\\"/jspdf.min.js\\"></script>");
        out.println("<script language=\\"javascript\\" src=\\"/jspdf.plugin.autotable.min.js\\"></script>");
        out.println("<script async defer language=\\"JavaScript\\" src=\\"https://cdn.plaid.com/link/v2/stable/link-initialize.js\\"></script>");
      }
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
      out.println("<link href=\\"https://fonts.googleapis.com/css?family=Roboto:100,300,400,500\\" rel=\\"stylesheet\\">");
      out.println("<link href=\\"https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i,900,900i\\" rel=\\"stylesheet\\">");
      out.println("<link href=\\"https://fonts.googleapis.com/css?family=IBM+Plex+Sans&display=swap\\" rel=\\"stylesheet\\">");
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

        if ( ! server.containsHostDomain(vhost) ) {
          vhost = getDefaultHost();
        }

        ThemeDomain themeDomain = (ThemeDomain) themeDomainDAO.find(vhost);
        if ( themeDomain == null ) {
          themeDomain = (ThemeDomain) themeDomainDAO.find(getDefaultHost());
        }
        if ( themeDomain == null ) {
          throw new RuntimeException("No theme domain found for default host " + getDefaultHost());
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

        this.populateHead(theme, out);

        out.println("</head>");
        out.println("<body>");

        out.println("<!-- Instantiate FOAM Application Controller -->");
        out.println("<!-- App Color Scheme, Logo, & Web App Name -->");
        out.println("<foam\\nclass=\\"net.nanopay.ui.Controller\\"\\nid=\\"ctrl\\"\\nwebApp=\\"" + theme.getAppName() + "\\">\\n</foam>");

        out.println("</body>");
        out.println("</html>");
      `
    }
  ]
});
