/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'BaseWizardlet',

  topics: ['saveEvent'],

  implements: [
    'foam.u2.wizard.Wizardlet'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.wizard.WizardletIndicator',
    'foam.u2.wizard.WizardletSection',
    'foam.u2.wizard.WAO'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function () {
        return foam.uuid.randomGUID();
      }
    },
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'title',
      class: 'String'
    },
    {
      flags: ['web'],
      name: 'currentSection',
      transient: true
    },
    {
      name: 'isValid',
      class: 'Boolean',
      expression: function (of, data, currentSection, data$errors_) {
        let sectionErrors = [];
        if ( currentSection && currentSection.section && data$errors_ ) {
          sectionErrors = data$errors_.filter(error =>
            currentSection.section.properties.includes(error[0])
          );
        }

        if ( ! this.of ) return true;
        if (
          ( ! data ) ||
          ( currentSection && currentSection.section )
            ? sectionErrors.length > 0
            : data$errors_
        ) {
          return false;
        }
        return true;
      }
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      documentation: `
        Specify the availability of this wizardlet. If true, wizardlet is
        available iff at least one section is available. If false, wizardlet
        does not display even if some sections are available.
      `,
    },
    {
      name: 'isVisible',
      class: 'Boolean',
      expression: function (of, isAvailable) {
        return isAvailable && of;
      }
    },
    {
      name: 'loading',
      class: 'Boolean'
    },
    {
      name: 'sections',
      flags: ['web'],
      transient: true,
      class: 'FObjectArray',
      of: 'foam.u2.wizard.WizardletSection',
      factory: function () {
        return foam.u2.detail.AbstractSectionedDetailView.create({
          of: this.of,
        }, this).sections.map(section => this.WizardletSection.create({
          section: section,
          wizardlet: this,
          isAvailable$: section.createIsAvailableFor(
            this.data$,
          )
        }));
      }
    },
    {
      name: 'wao',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.WAO',
      flags: ['web'],
      factory: function () {
        this.WAO.create();
      }
    },
    {
      name: 'indicator',
      class: 'Enum',
      of: 'foam.u2.wizard.WizardletIndicator',
      documentation: `
        Describes how this wizardlet will appear in the list of steps.
      `,
      expression: function (isValid) {
        return isValid ? this.WizardletIndicator.COMPLETED
          : this.WizardletIndicator.PLEASE_FILL;
      }
    }
  ],

  methods: [
    function validate() {
      return this.isValid;
    },
    function createView(data) {
      return null;
    },
    async function save() {
      this.indicator = this.WizardletIndicator.SAVING;
      var ret = await this.wao.save(this);
      this.clearProperty('indicator');
      this.saveEvent.pub(ret);
      return ret;
    },
    async function cancel() {
      this.indicator = this.WizardletIndicator.SAVING;
      var ret = await this.wao.cancel(this);
      this.clearProperty('indicator');
      return ret;
    },
    async function load() {
      await this.wao.load(this);
      return this;
    },
    {
      name: 'getDataUpdateSub',
      documentation: `
        Returns a subscription that publishes whenever the wizardlet's data or
        any property of the wizardlet's data - recursively - is updated.

        This is useful for checking if a wizardlet has unsaved changes.
      `,
      code: function (o$) {
        if ( ! o$ ) o$ = this.data$;

        var s = foam.core.FObject.create();

        var self = this;

        var bindProps = (sub1, o) => {
          if ( ! (o && o.cls_) ) return;
          var props = o.cls_.getAxiomsByClass(foam.core.Property);

          // Some wizardlet data objects have a "capability" property, and
          // Capability has a wizardlet property. This causes errors.
          if ( this.data && o.cls_.id == this.data.cls_.id ) {
            props = props.filter(p => p.name != 'capability')
          }

          for ( let prop of props ) {
            let prop$ = prop.toSlot(o);
            sub1.onDetach(this.getDataUpdateSub(prop$).sub(() => {
              if ( ! self.loading ) s.pub(o);
            }));
          }
        };

        var sub1 = foam.core.FObject.create();
        s.onDetach(o$.sub(o => {
          sub1.detach();
          sub1 = foam.core.FObject.create();
          s.onDetach(sub1);

          bindProps(sub1, o);
          if ( ! self.loading ) s.pub(o);
        }));

        s.onDetach(sub1);
        bindProps(sub1, o$.get());

        return s;
      }
    }
  ]
});
