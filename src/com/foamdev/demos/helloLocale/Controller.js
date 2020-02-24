/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 
//foam.language = 'fr';
//foam.language = 'en';
//foam.language = 'en-US';
//it will load the default locale from the browser.

foam.CLASS({
  package: 'com.foamdev.demos.helloLocale',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  css: `
    h1 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    {
      class: 'String',
      name: 'yourName',
      label: { en: 'Your Name', fr: 'Votre nom'},
      value: 'Jane Doe',
      view: {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please'
      }
    },
    {
      name: 'greeting',
      label: {
        'en'   : 'Hello ',
        'en-US': 'Howdy ',
        'fr'   : 'Bonjour ',
      },
    },
  ],

  methods: [
    function initE() {
      this.start('div').add(this.yourName$.label).end().start('div').add(this.YOUR_NAME).end();
      this.start('h1').add(this.greeting$.label).add(this.yourName$).add('!').end();
    }
  ]
});
