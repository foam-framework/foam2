/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Mixin',

  documentation: `
    Axiom which installs properties from another model. These installed
    properties behave as if they were defined on the model itself.
  `,

  properties: [
    {
      name: 'name',
      getter: function() { return 'mixin_' + this.path; }
    },
    'flags',
    'path',
    ['priority', 200]
  ],

  methods: [
    function installInClass(cls) {
      var m = this.__context__.lookup(this.path);
      if ( ! m ) throw 'No such interface or trait: ' + this.path;

      cls.installAxioms(m.getOwnAxioms());
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  package: 'foam.core',
  name: 'MixinModelRefine',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Mixin',
      name: 'mixins',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Mixin.create({path: o}) :
          foam.core.Mixin.create(o)         ;
      }
    }
  ]
});
