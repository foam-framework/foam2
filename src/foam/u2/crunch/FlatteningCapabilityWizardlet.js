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

  requires: [
    'foam.core.ArraySlot'
  ],

  properties: [
    {
      name: 'before',
      class: 'Boolean'
    },
    {
      name: 'indicator',
      class: 'Enum',
      of: 'foam.u2.wizard.WizardletIndicator',
      documentation: `
        Overrides the indicator property from BaseWizardlet to set the
        realIndicator property.
      `,
      setter: function (v) {
        this.realIndicator = v;
      }
    },
    {
      name: 'realIndicator',
      class: 'Enum',
      of: 'foam.u2.wizard.WizardletIndicator',
      documentation: `
        Stores the real indicator value for this wizardlet, since the exposed
        indicator property incorporates delegate wizardlets.
      `,
      expression: function (isValid) {
        return isValid ? this.WizardletIndicator.COMPLETED
          : this.WizardletIndicator.PLEASE_FILL;
      }
    },
    {
      name: 'delegates',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.ui.CapabilityWizardlet',
      postSet: function (o, n) {
        if ( this.delegatesSub_ ) this.delegatesSub_.detach();
        if ( ! n ) return;
        this.delegatesSub_ = foam.core.FObject.create();
        this.delegatesSub_.onDetach(this.ArraySlot.create({
          slots: n.map(delegate => delegate.indicator$)
        }).map(function (indicators) {
          indicators.push(this.realIndicator);
          var checkStates = ['PLEASE_FILL', 'SAVING', 'COMPLETED']
            .map(v => this.WizardletIndicator[v]);
          for ( let stateToCheck of checkStates ) {
            if ( indicators.some(v => v == stateToCheck) ) {
              this.indicator = stateToCheck;
              return;
            }
          }
          this.clearProperty('indicator');
        }));
      }
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
      // TODO: investigate why this.delegates$push doesn't work here
      this.delegates = [ ...this.delegates, wizardlet ];

      // Return true to prevent wizardlet from being pushed normally
      return true;
    },
    async function save(...args) {
      await foam.Promise.inOrder(this.delegates, d => d.save(...args));
      return await this.wao.save(this, ...args);
    },
    async function cancel() {
      await foam.Promise.inOrder(this.delegates, d => d.cancel());
      return await this.wao.cancel(this);
    },
    async function load() {
      await Promise.all(this.delegates.map(d => d.load()));
      return await this.wao.load(this);
    },
    {
      name: 'getDataUpdateSub',
      code: function () {
        // ???: Replace subs with slots to use ArraySlot here
        var s = foam.core.FObject.create();
        s.onDetach(this.SUPER().sub(() => {
          s.pub(true);
        }));
        for ( let wizardlet of this.delegates ) {
          s.onDetach(wizardlet.getDataUpdateSub().sub(() => {
            s.pub(true);
          }));
        }
        return s;
      }
    }
  ]
});
