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
      documentation: `
        An optional property for the original model section. This property must
        be set if customView is null.
      `
    },
    {
      name: 'title',
      class: 'String',
      documentation: 'Full title of this section.',
      expression: function(section) {
        return section && section.title;
      }
    },
    {
      name: 'wizardlet',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.Wizardlet',
      documentation: `
        This is a reference to the aggregating wizardlet.
      `
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
      class: 'Boolean',
      documentation: `
        This section is visible only when this property is true.
      `
    },
    {
      name: 'isValid',
      class: 'Boolean',
      documentation: `
        Indicates if this section in isolation is valid. If a model section is
        specified, this is determined automatically. For a custom view, this
        property should be overridden.
      `,
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
      class: 'foam.u2.ViewSpec',
      documentation: `
        A view to display for this section. If the 'section' property is set,
        this property will override it.
      `
    },
    {
      name: 'navTitle',
      class: 'String',
      documentation: 'Short title used for navigation menu items',
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
