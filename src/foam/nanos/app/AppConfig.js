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
      name: 'name',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'version',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'privacy',
      value: 'Privacy Policy',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'privacyUrl',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'copyright',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'url',
      value: 'http://localhost:8080/'
    },
    {
      class: 'String',
      name: 'urlLabel',
      value: 'FOAM Powered',
      visibility: 'RO'
    },
    {
      class:'String',
      name: 'termsAndCondLabel',
      value: 'Terms and Conditions',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'termsAndCondLink',
      visibility: 'RO'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.app.Mode',
      name: 'mode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'appLink',
      value: 'https://www.apple.com/lae/ios/app-store/',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'playLink',
      value: 'https://play.google.com/store?hl=en',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'enableForceHttps',
      value: true
    }
  ]
});
