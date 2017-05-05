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
      code: function() {
        // TODO:
        console.log('MENU: ', this.id);
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
