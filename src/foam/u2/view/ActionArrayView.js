foam.CLASS({
  package: 'foam.u2.view',
  name: 'ActionArrayView',
  extends: 'foam.u2.View',

  imports: [
    'theme'
  ],

  requires: [
    'foam.core.Action'
  ],

  // Although this is display:block, width:100% seems to be required
  // to prevent breaking existing layouts.
  css: `
    ^ {
      width: 100%;
    }
  `,

  properties: [
    {
      name: 'context'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());

      var self = this;
      this.add(this.slot(function (data) {
        let element = this.E('span');
        let oldAddContext = this.__subSubContext__;
        if ( self.context ) {
          this.__subSubContext__ = self.context;
        }
        let firstOne = true;
        data.forEach(action => {
          element.start(action, { data: data })
            .style({...(
              ( ! firstOne ) ? {
                'margin-left': this.theme.actionHorizontalPadding
              } : {}
            )})
            .end();
          firstOne = false;
        })
        if ( self.context ) {
          this.__subSubContext__ = oldAddContext;
        }
        return element;
      }));
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ActionArrayViewPaddingThemeRefinement',
  refines: 'foam.nanos.theme.Theme',

  sections: [
    {
      name: 'actions',
      title: 'Action Buttons'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'actionHorizontalPadding',
      value: '8px'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ActionArrayElementRefinement',
  refines: 'foam.u2.Element',

  requires: [
    'foam.core.Action',
    'foam.u2.view.ActionArrayView'
  ],

  methods: [
    function actions(arg, x) {
      return this.tag(this.ActionArrayView, {
        context: x || this.__subSubContext__,
        data: Array.isArray(arg) ? arg :
          arg.cls_.getAxiomsByClass(this.Action)
      });
    }
  ]
});
