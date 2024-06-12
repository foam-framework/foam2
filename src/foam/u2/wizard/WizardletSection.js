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
      name: 'wizardlet',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.Wizardlet'
    },
    {
      name: 'data',
      documentation: `
        This property will be set by the aggregating wizardlet.
      `,
      expression: function (wizardlet$data) {
        return wizardlet$data;
      }
    },
    {
      name: 'isAvailable',
      class: 'Boolean'
    },
    {
      name: 'isValid',
      class: 'Boolean',
      expression: function (wizardlet$of, data, data$errors_) {
        if ( ! wizardlet$of ) return true;
        if ( ! data ) return false;

        let sectionErrors = [];
        if ( data$errors_ ) {
          sectionErrors = data$errors_.filter(error =>
            this.section.properties.includes(error[0])
          );
        }
        return ! sectionErrors.length > 0;
      }
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
    },
  ],

  methods: [
    function createView(opt_spec) {
      if ( ! opt_spec ) opt_spec = {};
      var ctx = this.wizardlet.__subSubContext__.createSubContext();

      if ( this.customView ) {
        return this.ViewSpec.createView(
          this.customView, null, this, ctx);
      }

      
      ctx.register(
        this.VerticalDetailView,
        'foam.u2.detail.SectionedDetailView'
      );
      return this.SectionView.create({
        section: this.section,
        data$: this.wizardlet.data$,
        ...opt_spec
      }, ctx);
    }
  ],
});
