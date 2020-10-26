foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ReviewCapabilityView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.crunch.ui.UCJView',
    'foam.u2.detail.SectionedDetailView'
  ],

  properties: [
    {
      name: 'capabilityId',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .tag(this.UCJView, { data$: this.capabilityId$ })
        .tag(this.SectionedDetailView, {
          data$: this.data$
        })
        ;
    }
  ]
});
