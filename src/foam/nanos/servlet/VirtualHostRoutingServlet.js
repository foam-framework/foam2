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
      name: 'hostMapping'
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
      name: 'service',
      type: 'Void',
      args: [ { name: 'request', javaType: 'javax.servlet.ServletRequest' },
              { name: 'response', javaType: 'javax.servlet.ServletResponse' } ],
      javaThrows: [ 'javax.servlet.ServletException',
                    'java.io.IOException' ],
      javaCode: `
// Only works with HttpServletRequest as we need path information.
//javax.servlet.http.HttpServletRequest httpRequest = (javax.servlet.http.HttpServletRequest)request;

String vhost = request.getServerName();
//String target = httpRequest.getPathInfo();

String t = (String)getHostMapping().get(vhost);
if ( t == null ) {
  t = (String)getHostMapping().get(getDefaultHost());
}
if ( t == null ) {
  throw new RuntimeException("No vhost config found for default host " + getDefaultHost());
}

request.getRequestDispatcher(t).forward(request, response);
`
    }
  ]
});
