/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.validateAliasShortname',
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
      shortName: 'yourName',
      value: 'Jane Doe',
      view: {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please'
      },
      aliases: [ 'fname', 'fn', 'first' ]
    },
    {
      class: 'String',
      name: 'yourName1',
      shortName: 'yourName1', //'fname',
      value: 'Jane Doe',
      view: {
        class: 'foam.u2.TextField',
        onKey: true,
        placeholder: 'Your name please'
      },
      aliases: [ 'fname1', 'fn1', 'first1', 'yourName2' ]
    }
  ],

  methods: [
    function initE() {
      this.start('div').add('Name:').end().start('div').add(this.YOUR_NAME).end().
        start('h1').add('Hello ').add(this.yourName$).add('!').end();
    }
  ]
});
