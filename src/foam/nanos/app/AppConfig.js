/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'AppConfig',

  javaImports: [
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request'
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'version'
    },
    {
      class: 'String',
      name: 'privacy',
      value: 'Privacy Policy'
    },
    {
      class: 'String',
      name: 'privacyUrl'
    },
    {
      class: 'String',
      name: 'copyright'
    },
    {
      class: 'String',
      name: 'url',
      value: 'http://localhost:8080/'
    },
    {
      class: 'String',
      name: 'urlLabel',
      value: 'FOAM Powered'
    },
    {
      class: 'String',
      name: 'termsAndCondLabel',
      value: 'Terms and Conditions'
    },
    {
      class: 'String',
      name: 'termsAndCondLink'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.app.Mode',
      name: 'mode'
    },
    {
      class: 'String',
      name: 'appLink',
      value: 'https://www.apple.com/lae/ios/app-store/'
    },
    {
      class: 'String',
      name: 'playLink',
      value: 'https://play.google.com/store?hl=en'
    },
    {
      class: 'Boolean',
      name: 'forceHttps',
      value: false
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'defaultSpid'
    },
    {
      class: 'String',
      name: 'externalUrl'
    }
  ],

  methods: [
    {
      name: 'configure',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'host',
          type: 'String'
        }
      ],
      type: 'foam.nanos.app.AppConfig',
      javaCode: `
      AppConfig appConfig = (AppConfig) this.fclone();
      Theme theme = ((Themes) x.get("themes")).findTheme(x);
      AppConfig themeAppConfig = theme.getAppConfig();
      if ( themeAppConfig != null ) {
        appConfig.copyFrom(themeAppConfig);
      }

      String protocol = "http";
      int port = 80;
      String filename = null;
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        String surl = ((Request) req).getRootURL().toString();
        try {
          java.net.URL url = new java.net.URL(surl);
          protocol = url.getProtocol();
          port = url.getPort();
          filename = url.getFile();
          if ( host == null ) {
            host = url.getHost();
          }
        } catch (java.net.MalformedURLException e ) {
          ((foam.nanos.logger.Logger) x.get("logger")).error(surl, e);
        }
      }
      if ( ! "https".equals(protocol) &&
           appConfig.getForceHttps() ) {
        protocol = "https";
        port = 443;
      }
      if ( host == null ) {
        host = "localhost";
      } else if ( host.endsWith("/") ) {
        host = host.substring(0, host.length() -1);
      }
      try {
        java.net.URL url = new java.net.URL(protocol, host, port, filename);
        appConfig.setUrl(url.toString());
      } catch (java.net.MalformedURLException e) {
        ((foam.nanos.logger.Logger) x.get("logger")).error(e);
      }
      return appConfig;
      `
    }
  ]
});
