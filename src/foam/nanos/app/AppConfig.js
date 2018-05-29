/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'AppConfig',

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
      name: 'privacyUrl',
      value: 'https://nanopay.net/privacy-policy'
    },
    {
      class: 'String',
      name: 'copyright',
      value: 'Copyright © 2018 Nanopay. All rights reserved.'
    },
    {
      class: 'String',
      name: 'url',
      value: 'http://localhost:8080/'
    },
    {
      class: 'String',
      name: 'urlLabel',
      value: 'Powered by Nanopay'
    },
    {
      class:'String',
      name: 'termsAndCondLabel',
      value: 'Terms and Conditions'
    },
    {
      clsas: 'String',
      name: 'termsAndCondLink',
      value: 'net.nanopay.ui.modal.TandCModal'
    },
    {
      clsas: 'String',
      name: 'privacyLabel',
      value: 'Privacy Policy'
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
    }
  ]
});
