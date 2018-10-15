/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.hello',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ], //this property will allow the mapping between the model and the view.

  css: `
    .com-foam-demos-todojs-TodoView-done-true {//we can replace this by ^
      text-decoration: line-through;
      color: grey;
    }
    h2 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    { //TODO placeholder
      class: 'String',
      name: 'yourName',
      value: 'Toto',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    }
  ],

  methods: [
    function initE() {
      this.start('div').add('Name:').end().start('div').add(this.YOUR_NAME).end(). //or start(this.YOUR_NAME).attrs({onKey: true, placeholder:'Give yor name'}).end().      
        start('h1').add('Hello ').add(this.yourName$).add('!').end();
    }
  ]
});
