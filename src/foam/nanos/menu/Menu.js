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
    function createView(X) { return this.view; }
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
    function createView(X) {
      return { class: 'foam.u2.ListCreateController', dao: X[this.daoKey] };
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'TabsMenu',

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    }
  ],

  methods: [
    function createView(X, menu) {
      var tabs = foam.u2.Tabs.create();

      X.stack.push(tabs);

      menu.children.select({
        put: function(menu) {
          console.log(menu.label);
          if ( menu.handler )
          tabs.start({class: 'foam.u2.Tab', label: menu.label})
            .tag((menu.handler && menu.handler.createView(X, menu)) || 'Coming Soon!')
          .end();
        },
        eof: function() {}
      });

      return tabs;
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
        this.handler && X.stack.push(this.handler.createView(X, this));
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
