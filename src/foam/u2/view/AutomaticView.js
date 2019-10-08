foam.CLASS({
  package: 'foam.u2.view',
  name: 'AutomaticView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.view.AnyView',
    'foam.u2.detail.SectionedDetailView'
  ],

  documentation: `
    Automatically determins the correct view for a property
    of type 'Object'.
  `,

  methods: [
    function initE() {
      var self = this;

      if ( foam.core.FObject.isInstance(self.data) ) {
        self.start(this.SectionedDetailView, {
          data: self.data
        });
      } else {
        self.start(this.AnyView, {
          data: self.data
        });
      }
    }
  ]
});