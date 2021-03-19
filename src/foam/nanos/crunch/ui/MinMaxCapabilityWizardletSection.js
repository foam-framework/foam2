/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'MinMaxCapabilityWizardletSection',
  extends: 'foam.u2.wizard.WizardletSection',
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
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      name: 'choiceWizardlets',
      factory: function() {
        return [];
      }
    },
    {
      // TODO: Add for base WizardletSection
      class: 'Boolean',
      name: 'isLoaded'
    }
  ],

  methods: [
    function createView() {
      return foam.u2.Element.create(null, this).add(this.slot(function(isLoaded){
        if (isLoaded){
          var vs = this.ViewSpec.createView(
            this.customView, this.customView, this, this.__subContext__
          );
    
          this.choiceWizardlets.forEach((choiceWizardlet) => {
            choiceWizardlet.isAvailable$ = vs.getSelectedSlot(choiceWizardlet.capability);
          })
    
          return vs;
        }
        return null;
      }));
    }
  ],
});
