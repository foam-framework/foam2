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
        return [];
      }
    },
    {
      name: 'min',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          // a capability min of 0 denotes no minimum limit
          return this.capability.min > 0 ? this.capability.min : this.choices.length;
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
          var isFinal =
            wizardlet.status === this.CapabilityJunctionStatus.GRANTED ||
            wizardlet.status === this.CapabilityJunctionStatus.PENDING;

          return [wizardlet.title, wizardlet.title, isFinal ? true : wizardlet.isAvailable$, isFinal ?  foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW, isFinal]
        })
      }
    },
    {
      class: 'Boolean',
      name: 'isValid',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isVisible',
      expression: function (isAvailable) {
        return isAvailable;
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
      postSet: function(_,n){
        if ( !n ){
          this.choiceWizardlets.forEach(cw => {
            cw.isAvailable = false
            cw.cancel();
          });

          this.cancel();
        } else {
          this.save();
        }
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
