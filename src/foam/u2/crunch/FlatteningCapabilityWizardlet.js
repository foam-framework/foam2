/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'FlatteningCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',
  implements: [ 'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet' ],
  documentation: `
    Displays prerequisite capabilities in the same wizardlet.
  `,

  properties: [
    {
      name: 'before',
      class: 'Boolean'
    },
    {
      name: 'delegates',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.ui.CapabilityWizardlet'
    },
    {
      name: 'sections',
      flags: ['web'],
      transient: true,
      class: 'FObjectArray',
      of: 'foam.u2.wizard.WizardletSection',
      factory: function () {
        var sections = foam.u2.detail.AbstractSectionedDetailView.create({
          of: this.of,
        }, this).sections.map(section => this.WizardletSection.create({
          section: section,
          wizardlet: this,
          isAvailable$: section.createIsAvailableFor(
            this.data$,
          )
        }));

        var prereqSections = this.delegates.reduce((sections, delegate) => {
          return sections.concat(delegate.sections);
        }, []);
        return this.before ? sections.concat(prereqSections)
          : prereqSections.concat(sections);
      }
    },
  ],

  methods: [
    function addPrerequisite(wizardlet) {
      // Add prerequisite to delegate wizardlets
      this.delegates.push(wizardlet);

      // Return true to prevent wizardlet from being pushed normally
      return true;
    },
    async function save() {
      await foam.Promise.inOrder(this.delegates, d => d.save());
      return await this.wao.save(this);
    },
    async function cancel() {
      await foam.Promise.inOrder(this.delegates, d => d.cancel());
      return await this.wao.cancel(this);
    },
    async function load() {
      await Promise.all(this.delegates.map(d => d.load()));
      return await this.wao.load(this);
    }
  ]
});
