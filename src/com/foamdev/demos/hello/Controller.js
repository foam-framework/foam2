/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.hello',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['as data']

  //exports: [ 'as data' ], //FOAM has DI (Dependency Injection) built-in at the object level.

  css: `
    h1 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    {
      class: 'String',
      name: 'yourName',
      value: 'Jane Doe',
      view: {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please'
      }
    }
  ],

  methods: [
    function initE() {
      this.start('div').add('Name:').end().start('div').add(this.YOUR_NAME).end(). 
        //or start(this.YOUR_NAME).attrs({onKey: true, placeholder:'Your name please'}).end().      
        start('h1').add('Hello ').add(this.yourName$).add('!').end();
    }
  ]
});
