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

  properties: [
    {
      class: 'Map',
      name: 'customHostMapping',
      documentation: `
        Custom host mapping that will directly serve the index file for the specified virtual host.
      `
    },
    {
      class: 'Boolean',
      name: 'liveScriptBundlerDisabled',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isProduction',
      value: false
    },
    {
      class: 'String',
      name: 'defaultHost'
    },
    {
      class: 'Object',
      transient: true,
      javaType: 'javax.servlet.ServletConfig',
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
      args: [ { name: 'config', javaType: 'javax.servlet.ServletConfig' } ],
      javaCode: 'setServletConfig(config);',
      code: function() { }
    },
    {
      name: 'getTagString',
      type: 'String',
      documentation: `Utility method that returns an html tag string.`,
      args: [ 
        { name: 'tag', javaType: 'String'},
        { name: 'keywords', javaType: 'java.util.ArrayList<String>'},
        { name: 'attributes', javaType: 'java.util.HashMap'},
        { name: 'hasClosingTag', javaType: 'Boolean'},
        { name: 'isSingleClosingTag', javaType: 'Boolean'}
      ],
      javaCode: `
        String tagString = "<" + tag + " ";
        for ( String keyword : keywords ) {
          tagString += keyword + " ";
        }
        java.util.Iterator i = attributes.entrySet().iterator();
        while ( i.hasNext() ) {
          java.util.Map.Entry attribute = (java.util.Map.Entry) i.next();
          tagString += attribute.getKey() + "=\\"" + attribute.getValue() + "\\" ";
          i.remove();
        }
        if ( isSingleClosingTag ) {
          return tagString += "/>";
        }
        tagString += ">";
        tagString += hasClosingTag ? "</" + tag + ">" : "";
        return tagString;
      `
    },
    {
      name: 'populateHead',
      type: 'Void',
      documentation: `
        Generates the index file's head content based on theme and prints it to the response writer.
      `,
      args: [ 
        { name: 'theme', javaType: 'foam.nanos.theme.Theme'},
        { name: 'out', javaType: 'java.io.PrintWriter'} 
      ],
      javaCode: `
      out.println("<meta charset=\\"utf-8\\"/>");
      out.println("<title>" + theme.getAppName() + "</title>");
      java.util.ArrayList<java.util.HashMap> headConfig = (java.util.ArrayList<java.util.HashMap>) theme.getHeadConfig();

      for ( int i = 0; i < headConfig.size(); i++ ) {
        java.util.HashMap tagConfig = (java.util.HashMap) headConfig.get(i);
        java.util.ArrayList<String> keywords = new java.util.ArrayList<String>();
        if ( tagConfig.containsKey("keywords") ) {
          keywords = (java.util.ArrayList<String>) tagConfig.get("keywords");
        }
        Boolean hasClosingTag = false;
        if ( tagConfig.containsKey("hasClosingTag") ) {
          hasClosingTag = (Boolean) tagConfig.get("hasClosingTag");
        }
        Boolean isSingleClosingTag = false;
        if ( tagConfig.containsKey("isSingleClosingTag") ) {
          isSingleClosingTag = (Boolean) tagConfig.get("isSingleClosingTag");
        }
        String headTag = this.getTagString((String)tagConfig.get("tag"), keywords, (java.util.HashMap)tagConfig.get("attributes"), hasClosingTag, isSingleClosingTag);
        out.println(headTag);
      }
      if ( this.getIsProduction() ) {
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
      args: [ { name: 'request', javaType: 'javax.servlet.ServletRequest' },
              { name: 'response', javaType: 'javax.servlet.ServletResponse' } ],
      javaThrows: [ 'javax.servlet.ServletException',
                    'java.io.IOException' ],
      javaCode: `
        String vhost = request.getServerName();
        
        if ( getCustomHostMapping().containsKey(vhost) ) {
          request.getRequestDispatcher((String) getCustomHostMapping().get(vhost)).forward(request, response);
          return;
        }

        foam.core.X x = (foam.core.X) this.getServletConfig().getServletContext().getAttribute("X");
        foam.dao.DAO themeDomainDAO = (foam.dao.DAO) x.get("themeDomainDAO");
        foam.dao.DAO themeDAO = (foam.dao.DAO) x.get("themeDAO");

        foam.nanos.theme.ThemeDomain themeDomain = (foam.nanos.theme.ThemeDomain) themeDomainDAO.find(vhost);
        if ( themeDomain == null ) {
          themeDomain = (foam.nanos.theme.ThemeDomain) themeDomainDAO.find(getDefaultHost());
        }
        if ( themeDomain == null ) {
          throw new RuntimeException("No theme domain found for default host " + getDefaultHost());
        }

        foam.nanos.theme.Theme theme = (foam.nanos.theme.Theme) themeDAO.find(themeDomain.getTheme());
        if ( theme == null ) {
          throw new RuntimeException("No theme found for theme domain " + themeDomain.getId());
        }

        response.setContentType("text/html; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        java.io.PrintWriter out = response.getWriter();
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
