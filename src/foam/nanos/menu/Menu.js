/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'Menu',

  tableColumns: [ 'id', 'parent', 'label', 'order' ],

  imports: [
    'lastMenuLaunchedListener?'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 280
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'FObjectProperty',
      name: 'handler',
      view: { class: 'foam.u2.view.FObjectView' }
    },
    {
      class: 'Int',
      name: 'order',
      value: 1000
    }
  ],

  methods: [
    function launch_(X, e) {
      this.lastMenuLaunchedListener && this.lastMenuLaunchedListener(this);
      this.handler && this.handler.launch(X, this, e);
    }
  ],

  actions: [
    {
      name: 'launch',
      code: function(X, e) {
        this.launch_(X, e);
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
