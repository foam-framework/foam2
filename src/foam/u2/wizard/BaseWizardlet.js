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

  imports: [
    'wizardCloseSub?'
  ],

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.borders.LoadingLevel',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.wizard.WizardletAware',
    'foam.u2.wizard.WizardletIndicator',
    'foam.u2.wizard.WizardletSection',
    'foam.u2.wizard.WAO',
    'foam.u2.wizard.ProxyWAO',
    'foam.u2.wizard.internal.FObjectRecursionSlot',
    'foam.u2.wizard.internal.WizardletAutoSaveSlot'
  ],

  constants: [
    {
      name: 'SAVE_DELAY',
      // TODO: once changes are made to input views to reduce property updates,
      //       this can be decreased to around 100-200ms
      value: 1000,
      documentation: 'How long input must be idle before an auto-save'
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

        Wizardlet availability determines whether or not the wizardlet will be
        saved. An invisible wizardlet can still be available.
      `
    },

    {
      name: 'isVisible',
      class: 'Boolean',
      documentation: `
        Specify the visibility of this wizardlet. If true, 'createView' will
        be called on any of this wizardlets visible sections.
      `,
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
      documentation: `
        Indicates that the wizardlet's 'data' is being saved or modified by a
        WAO.
      `,
      class: 'Boolean',
      postSet: function (_, n) {
        if ( ! n ) this.LoadingLevel = this.LoadingLevel.IDLE;
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
      documentation: `
        A wizardlet's WAO (Wizardlet Access Object) implements the behavior of
        the save and load operations.
      `,
      factory: function () {
        this.ProxyWAO.create();
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
    },
    {
      name: 'loadingLevel',
      class: 'Enum',
      of: 'foam.u2.borders.LoadingLevel',
      documentation: `
        Indicates the loading state the UI should present this wizardlet in.
        This is used to control a LoadingBorder wraping the wizardlet.
      `
    },
    {
      name: '__subSubContext__',
      documentation: 'Current subContext to use when creating view.',
      factory: function() { return this.__subContext__; }
    }
  ],

  methods: [
    function validate() {
      return this.isValid;
    },
    function createView(data) {
      return null;
    },
    async function save(options) {
      this.indicator = this.WizardletIndicator.SAVING;
      var ret = await this.wao.save(this, options);
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
    function reportNetworkFailure() {
      this.indicator = this.WizardletIndicator.NETWORK_FAILURE;
    },
    {
      name: 'getDataUpdateSub',
      documentation: `
        Returns a subscription that publishes whenever the wizardlet's data or
        any property of the wizardlet's data - recursively - is updated.

        This is useful for checking if a wizardlet has unsaved changes.
      `,
      code: function () {
        var filter = foam.u2.wizard.Slot.filter;
        var s = this.SimpleSlot.create();
        var slotSlot = this.data$
          .map(data => {
            var updateSlot = (
              this.WizardletAware.isInstance(data) &&
              data.customUpdateSlot
            ) ? data.getUpdateSlot()
              : this.FObjectRecursionSlot.create({ obj: data });
            return this.WizardletAutoSaveSlot.create({
              // Clear pending auto-saves if we start saving or finish loading
              saveEvent: this.loading$,
              // Listen to property updates if not loading
              other: filter(updateSlot, () => ! this.loading),
              delay: this.SAVE_DELAY,
            });
          });
        slotSlot.valueSub(() => { s.set(slotSlot.get().get()); });
        if ( this.wizardCloseSub ) {
          this.wizardCloseSub.onDetach(s);
          this.wizardCloseSub.onDetach(slotSlot);
        } else {
          console.error(
            'wizardlet update listener will not detach! ' +
            'This wizardlet my be used from an invalid context');
        }
        return s;
      }
    },
    function pushContext(m) {
      this.__subSubContext__ = this.__subSubContext__.createSubContext(m);
      if ( this.data ) this.data = this.data.clone(this.__subSubContext__);
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
