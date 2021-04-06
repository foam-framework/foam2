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
      documentation: 'Set at startup in bootscript.',
      class: 'String',
      name: 'version',
      visibility: 'RO',
      storageTransient: true,
      javaSetter: `
      // Explicitly set in bootscript from jar manifest or services.0.
      // Ignore updates from runtime journals.  If updates are not
      // supressed, then on next upgrade the VirtualHostRoutingServlet
      // will craft an index.html with references to a, now, non-existant
      // foam-bin js file.
      synchronized ( this ) {
        if ( ! versionIsSet_ ) {
          version_ = val;
          versionIsSet_ = true;
        }
      }
      `
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
      documentation: 'Set by Theme',
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
      value: 'https://www.apple.com/lae/ios/app-store/',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'playLink',
      value: 'https://play.google.com/store?hl=en',
      visibility: 'HIDDEN'
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
      return this;
      `
    }
  ]
});
