/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.helloMVC',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['as data']

  //exports: [ 'data as dataImported' ],  //FOAM has DI (Dependency Injection) built-in at the object level.
  //exports: [ 'data' ],

  requires: [
    'com.foamdev.demos.helloMVC.Hello',
    'com.foamdev.demos.helloMVC.HelloView',
  ],


  properties: [
    {
      name   : 'data',
      factory: function() { return this.Hello.create(); }//.yourName
    }
  ],

  methods: [
    function initE() {
      this.start(com.foamdev.demos.helloMVC.HelloView);
    }
  ]
});
