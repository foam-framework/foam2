/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Add HTML element to the view

foam.CLASS({
  package: 'com.foamdev.demos.addHTMLElement',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['as data']
  //extends: 'foam.u2.Element',

  //exports: [ 'as data' ], //FOAM has DI (Dependency Injection) built-in at the object level.

  css: `
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  methods: [
    function initE() {
      this.
        start(this.ADD_ELEMENT_TO_DOM, {label: 'add element to the HTML using the DOM'}).end();
    }
  ],
  actions: [
    {
      name:  'addElementToDOM',
      label: 'add a DOM',
      help:  'Add HTML element to the view',

      code: function() {
        this.start('div').add('here you are').end();
      }
    }
  ],
});
