foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'MenuDefinedViewList',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'containerView',
      class: 'foam.u2.ViewSpec'
    },
    {
      name: 'childViews',
      class: 'FObjectArray',
      of: 'foam.u2.View'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      var view = this;

      view = view
        .start(self.containerView);
      
      for ( var i = 0; i < self.childViews.length; i++ ) {
        view = view
          .start(self.childViews[i]).end();
      }

      view = view
        .end();
    }
  ]
});