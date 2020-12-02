/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.extendsDemo',
  name: 'HelloView',
  extends: 'foam.u2.View',

  imports: [
    'propFromController'
  ],

  properties: [
    {
      name   : 'propFromHelloView',
      value  : 'Hi'
    }
  ],
  methods: [
    function initE() {
        this.start('h1').add('Hello ').add(this.data.yourName$).add('!').end();
    },
    function hi() {
      console.log('Hi');
    }
  ]
});
