foam.CLASS({
  package: 'foam.u2.view',
  name: 'AutomaticView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.FObject',
    'foam.u2.view.AnyView',
    'foam.u2.detail.SectionedDetailView'
  ],

  documentation: `
    Automatically determines the correct view for a property of type 'Object'.
  `,

  methods: [
    function initE() {
      if ( this.FObject.isInstance(this.data) ) {
        this.start(this.SectionedDetailView, { data: this.data });
      } else {
        this.tag(this.AnyView, { data: this.data });
      }
    }
  ]
});
