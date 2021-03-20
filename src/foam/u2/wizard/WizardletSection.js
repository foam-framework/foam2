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
    'foam.layout.Section',
    'foam.u2.detail.SectionView',
    'foam.u2.detail.VerticalDetailView',
    'foam.u2.ViewSpec',
  ],

  properties: [
    {
      name: 'sectionAxiom',
      class: 'FObjectProperty',
      of: 'foam.layout.SectionAxiom'
    },
    {
      name: 'title',
      class: 'String',
      expression: function(sectionAxiom) {
        return sectionAxiom && sectionAxiom.title;
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

        var properties = [];
        (() => {
          var section = this.Section.create().fromSectionAxiom(
            this.sectionAxiom, wizardlet$of);
          properties = section.properties;
        })();

        let sectionErrors = [];
        if ( data$errors_ ) {
          sectionErrors = data$errors_.filter(error =>
            properties.includes(error[0])
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
      expression: function(sectionAxiom) {
        return sectionAxiom && sectionAxiom.navTitle;
      }
    }
  ],

  methods: [
    function createView(opt_spec) {
      if ( ! opt_spec ) opt_spec = {};
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
        sectionName: this.sectionAxiom.name,
        data$: this.wizardlet.data$,
        ...opt_spec
      }, ctx);
    }
  ],
});
