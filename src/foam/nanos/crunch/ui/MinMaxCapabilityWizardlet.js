/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'MinMaxCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

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
      name: 'mustBeValid',
      class: 'Boolean',
      value: true
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
          var isFinal = wizardlet.ucj !== null &&
          (
            wizardlet.ucj.status != this.CapabilityJunctionStatus.GRANTED ||
            wizardlet.ucj.status != this.CapabilityJunctionStatus.PENDING
          )

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
    function createView(data) {    
      return this.MultiChoiceView.create({
        choices$: this.choices$,
        booleanView: this.CardSelectView,
        isValidNumberOfChoices$: this.isValid$,
        minSelected$: this.min$,
        maxSelected$: this.max$
      });
    }
  ]
});
