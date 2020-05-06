/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.extendsDemo',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  exports: [ 'propFromController' ], 

  requires: [
    'com.foamdev.demos.extendsDemo.Hello',
    'com.foamdev.demos.extendsDemo.HelloView',
    'com.foamdev.demos.extendsDemo.HelloExtendsView',
  ],

  properties: [
    {
      name   : 'helloUser',
      factory: function() { return this.Hello.create(); }
    }
    ,
    {
      name   : 'propFromController',
      value  : 'propFromController'
    }
  ],

  methods: [
    function initE() {
      this.tag(this.HelloExtendsView, {data: this.helloUser});
    }
  ]
});
