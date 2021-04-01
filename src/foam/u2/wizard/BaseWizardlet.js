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
    'foam.u2.wizard.WizardletAware',
    'foam.u2.wizard.WizardletIndicator',
    'foam.u2.wizard.WizardletSection',
    'foam.u2.wizard.WAO',
    'foam.u2.wizard.internal.FObjectRecursionSlot',
    'foam.u2.wizard.internal.WizardletAutoSaveSlot'
  ],

  constants: [
    {
      name: 'SAVE_DELAY',
      value: 1200
    }
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
      name: 'data',
      postSet: function (_, n) {
        if ( this.of && this.WizardletAware.isInstance(n) ) {
          n.installInWizardlet(this);
        }
      }
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
      expression: function (of, isAvailable, atLeastOneSectionVisible_) {
        return isAvailable && of && atLeastOneSectionVisible_;
      }
    },
    { name: 'atLeastOneSectionVisible_', class: 'Boolean', value: true },
    {
      name: 'reloadAfterSave',
      class: 'Boolean',
      value: true
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
        var sections = foam.u2.detail.AbstractSectionedDetailView.create({
          of: this.of,
        }, this).sections.map(section => this.WizardletSection.create({
          section: section,
          wizardlet: this,
          isAvailable$: section.createIsAvailableFor(
            this.data$,
          )
        }));
        for ( let section of sections ) {
          this.onDetach(section.isAvailable$.sub(
            this.updateVisibilityFromSectionCount));
        }
        this.updateVisibilityFromSectionCount();
        return sections;
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
      code: function () {
        var self = this;
        var filter = foam.u2.wizard.Slot.filter;
        var customUpdateSlot = false;
        if ( this.of && this.WizardletAware.isSubClass(this.of) ) {
          customUpdateSlot = this.data && this.data.customUpdateSlot;
        }
        if ( customUpdateSlot ) {
          var s = foam.core.FObject.create();
          this.data$
            .map(data => {
              var updateSlot = data.getUpdateSlot();
              return this.WizardletAutoSaveSlot.create({
                other: filter(updateSlot, v => v && ! self.loading),
                delay: self.SAVE_DELAY
              });
            })
            .valueSub(() => { if ( ! self.loading ) s.pub(true); });
          return s;
        }
        var sl = this.FObjectRecursionSlot.create({ obj$: this.data$ });
        return filter(this.WizardletAutoSaveSlot.create({
          other: filter(sl, () => ! self.loading),
          delay: self.SAVE_DELAY
        }), () => ! self.loading);
      }
    }
  ],

  listeners: [
    function updateVisibilityFromSectionCount() {
      if ( ! this.sections ) return;
      this.atLeastOneSectionVisible_ = this.sections.filter(
        v => v.isAvailable).length > 0;
    }
  ]
});
