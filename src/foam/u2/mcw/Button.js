foam.CLASS({
  package: 'foam.u2.mcw',
  name: 'Button',
  extends: 'foam.u2.ActionView',

  properties: [
    {
      name: 'ripple_',
      factory: function() { return new mdc.ripple.MDCRipple(this.el()); }
    },
    {
      class: 'Boolean',
      name: 'raised',
      value: true
    },
    {
      class: 'Boolean',
      name: 'primary',
      value: false
    }
  ],

  methods: [
    function initE() {
      this.attrs({type: 'button'}).SUPER();
    },

    function load() {
      this.SUPER();
      this.ripple_.foundation_.init();
    },

    function initCls() {
      this.cssClass('mdc-button');
      if ( this.raised  ) this.cssClass('mdc-button--raised');
      if ( this.primary ) this.cssClass('mdc-button--primary');
    }
  ]
});
