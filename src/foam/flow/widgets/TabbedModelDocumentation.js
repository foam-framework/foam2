/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'TabbedModelDocumentation',
  extends: 'foam.u2.Element',
  documentation: `
    Display ModelSummary, PropertyShortSummary, and MethodShortSummary in a
    single tabbed view.
  `,

  requires: [
    'foam.flow.widgets.PropertyShortSummary',
    'foam.flow.widgets.MethodShortSummary',
    'foam.flow.widgets.ModelSummary',
    'foam.u2.Tab',
    'foam.u2.Tabs'
  ],

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'defaultTab',
      class: 'String',
      value: 'summary'
    }
  ],

  messages: [
    { name: 'TAB_SUMMARY', message: 'Summary' }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .start(this.Tabs)
          .start(this.Tab, {
            label: this.TAB_SUMMARY,
            selected: this.defaultTab == 'summary'
          })
            .tag(this.ModelSummary, { of$: this.of$ })
          .end()
          .start(this.Tab, {
            label: foam.core.Model.METHODS.label,
            selected: this.defaultTab == 'methods'
          })
            .tag(this.MethodShortSummary, { of$: this.of$ })
          .end()
          .start(this.Tab, {
            label: foam.core.Model.PROPERTIES.label,
            selected: this.defaultTab == 'properties'
          })
            .tag(this.PropertyShortSummary, { of$: this.of$ })
          .end()
        .end()
        ;
    },
    function matchRef(id) {
      if ( typeof id !== 'string' ) return id;
      if ( this.capabilityDAO ) {
        return this.PromiseSlot.create({
          promise: this.capabilityDAO.find(id)
        }).map(found => found
          ? this.Element.create({ nodeName: 'a' })
            .attrs({
              href: '#admin.crunchlab:'+id,
              target: '_blank'
            })
            .add(id)
          : id
        );
      }
    }
  ]
});
