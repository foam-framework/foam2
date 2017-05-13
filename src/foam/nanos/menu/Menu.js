/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'ViewMenu',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    }
  ],

  methods: [
    function execute(X) {
      X.stack.push(this.view);
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DAOMenu',

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    }
  ],

  methods: [
    function execute(X) {
      X.stack.push({class: 'foam.u2.ListCreateController', dao: X[this.daoKey]});
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'Menu',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'FObjectProperty',
      name: 'handler'
    }
  ],

  actions: [
    {
      name: 'launch',
      code: function(X) {
        console.log('MENU: ', this.id);
        this.handler && this.handler.execute(X);
      }
    }
  ]
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.menu.Menu',
  targetModel: 'foam.nanos.menu.Menu',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    class: 'String',
    value: ''
  }
});
