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
          var isFinal = wizardlet.ucj !== null &&
          (
            wizardlet.ucj.status === this.CapabilityJunctionStatus.GRANTED ||
            wizardlet.ucj.status === this.CapabilityJunctionStatus.PENDING
          )

          return [wizardlet.title, wizardlet.title, isFinal ? true : wizardlet.isAvailable$, isFinal ?  foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW, isFinal]
        })
      }
    },
    {
      name: 'sections',
      flags: ['web'],
      transient: true,
      class: 'FObjectArray',
      of: 'foam.u2.wizard.WizardletSection',
      factory: function () {
        return [
          this.WizardletSection.create({
            isAvailable: true,
            title: this.capability.name,
            customView: {
              class: 'foam.u2.view.MultiChoiceView',
              choices$: this.choices$,
              booleanView: this.CardSelectView,
              isValidNumberOfChoices$: this.isValid$,
              showValidNumberOfChoicesHelper: false,
              minSelected$: this.min$,
              maxSelected$: this.max$
            }
          })
        ];
      }
    },
    {
      class: 'Boolean',
      name: 'isValid',
      value: false
    },
    {
      name: 'isVisible',
      class: 'Boolean',
      expression: function(isAvailable) {
        return isAvailable;
      }
    }
  ],

  methods: [
    function createView(data) {
      return foam.u2.view.MultiChoiceView.create({
        choices$: this.choices$,
        booleanView: foam.u2.view.CardSelectView,
        isValidNumberOfChoices$: this.isValid$,
        minSelected$: this.min$,
        maxSelected$: this.max$
      });
    }
  ]
});
