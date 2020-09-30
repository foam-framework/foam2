/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableMinMaxCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapableObjectWizardlet',

  imports: [
    'capable',
    'payload?'
  ],

  requires: [
    'foam.u2.view.MultiChoiceView',
    'foam.u2.view.CardSelectView',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      name: 'choiceWizardlets',
      factory: function() {
        return []
      }
    },
    {
      name: 'min',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          return this.capability.min;
        }
      }
    },
    {
      name: 'max',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          return this.capability.max;
        }
      }
    },
    {
      name: 'choices',
      expression: function(choiceWizardlets){
        return choiceWizardlets.map(wizardlet => {

          var isFinal = wizardlet.targetPayload.status !== null &&
            (
              wizardlet.targetPayload.status === this.CapabilityJunctionStatus.GRANTED ||
              wizardlet.targetPayload.status === this.CapabilityJunctionStatus.PENDING
            );

          return [wizardlet.title, wizardlet.title, isFinal ? true : wizardlet.isAvailable$, isFinal ?  foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW, isFinal]
        })
      }
    },
    {
      class: 'Boolean',
      name: 'isValid',
      value: false
    }
  ],

  methods: [
    {
      name: 'save',
      code: async function() {
        // TODO: Need to also account for unsave

        var filteredCapablePayloads  =  this.capable.capablePayloads.filter(cp => {
          return cp.capability.name === this.targetPayload.capability.name
        });

        if (  filteredCapablePayloads.length === 0 ) this.capable.capablePayloads.push(this.targetPayload);
      }
    },
    {
      name: 'adjustCapablePayloads',
      code: function(oldChoices, newChoices) {
        debugger;
        var choiceWizardlets = this.choiceWizardlets;

        var selectedOldChoices = oldChoices.filter(choice => typeof choice[2] === 'object' ? choice[2].get() : choice[2]);
        var selectedNewChoices = newChoices.filter(choice => typeof choice[2] === 'object' ? choice[2].get() : choice[2]);

        if ( selectedOldChoices.length > selectedNewChoices.length ){
          var deselectedChoice = selectedOldChoices.filter(choice => selectedNewChoices.indexOf(choice) == -1)

          var deselectedWizard = choiceWizardlets.filter(wizard => wizard.title === deselectedChoice[0]);

          var { targetPayload } =  deselectedWizard;

          this.capable.capablePayloads = this.capable.capablePayloads.filter(capablePayload => capablePayload !== targetPayload);

        } else if (selectedOldChoices.length < selectedNewChoices.length ) {

          var selectedChoice = selectedNewChoices.filter(choice => selectedOldChoices.indexOf(choice) == -1)

          var selectedWizard = choiceWizardlets.filter(wizard => wizard.title === selectedChoice[0][0]);

          var { targetPayload } =  selectedWizard[0];

          this.capable.capablePayloads.push(targetPayload);

        } else {
          console.warn('Both selectedOldChoices and selectedNewChoices should  not have the same length');
        }
      }
    },
    function createView(data) {    
      return this.MultiChoiceView.create({
        choices$: this.choices$,
        booleanView: this.CardSelectView,
        isValidNumberOfChoices$: this.isValid$,
        minSelected$: this.min$,
        maxSelected$: this.max$,
        onSelect: this.adjustCapablePayloads.bind(this)
      });
    }
  ]
});
