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
          name: 'url',
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

      String configUrl = url;
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        configUrl = ((Request) req).getRootURL().toString();
      }
      if ( ! foam.util.SafetyUtil.isEmpty(configUrl) ) {
        if ( appConfig.getForceHttps() ) {
          if ( configUrl.startsWith("https://") ) {
             // nop
          } else if ( configUrl.startsWith("http://") ) {
            configUrl = "https" + configUrl.substring(4);
          } else {
            configUrl = "https://" + configUrl;
          }
        }
        if ( configUrl.endsWith("/") ) {
          configUrl = configUrl.substring(0, configUrl.length()-1);
        }
        appConfig.setUrl(configUrl);
      }

      return appConfig;
      `
    }
  ]
});
