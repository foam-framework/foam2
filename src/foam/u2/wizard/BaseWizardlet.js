/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'BaseWizardlet',

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
      name: 'isValid',
      class: 'Boolean',
      expression: function (of, data, data$errors_) {
        if ( ! this.of ) return true;
        if ( ! data || data$errors_ ) {
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
      return await this.wao.save(this);
    },
    async function cancel() {
      return await this.wao.cancel(this);
    },
    async function load() {
      await this.wao.load(this);
      return this;
    }
  ]
});
