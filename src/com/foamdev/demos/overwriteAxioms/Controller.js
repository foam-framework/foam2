/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.overwriteAxioms',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['this as data']

  //exports: [ 'HelloUser' ], //FOAM has DI (Dependency Injection) built-in at the object level.

  requires: [
    'com.foamdev.demos.overwriteAxioms.Hello',
    'com.foamdev.demos.overwriteAxioms.HelloView',
  ],

  properties: [
    {
      name   : 'helloUser',
      factory: function() { return this.Hello.create(); }
    }
  ],

  methods: [
    function initE() {
      this.tag(this.HelloView, {data: this.helloUser});
    }
  ]
});
