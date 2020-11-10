/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'WizardletSection',
  flags: ['web'],
  documentation: `
    Describes a sub-section of a wizardlet.
  `,

  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.ViewSpec',
  ],

  properties: [
    {
      name: 'section',
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
    },
    {
      name: 'title',
      class: 'String',
      expression: function(section) {
        return section && section.title;
      }
    },
    {
      name: 'data',
      documentation: `
        This property will be set by the aggregating wizardlet.
      `
    },
    {
      name: 'isAvailable',
      class: 'Boolean'
    },
    {
      name: 'customView',
      class: 'foam.u2.ViewSpec'
    },
    {
      name: 'navTitle',
      class: 'String',
      expression: function(section) {
        return section && section.navTitle;
      }
    }
  ],

  methods: [
    function createView() {
      if ( this.customView ) {
        return this.ViewSpec.createView(
          this.customView, null, this, this.__subContext__);
      }
      var ctx = this.__subContext__.createSubContext();
      ctx.register(
        this.VerticalDetailView,
        'foam.u2.detail.SectionedDetailView'
      );
      return this.SectionView.create({
        section: this.section,
        data$: this.data$,
      }, ctx)
    }
  ],
});