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
    'payload?',
    'capabilityDAO'
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
            
            this.capable.getCapablePayloadDAO().remove(
              cw.targetPayload).then(() => {
                this.capabilityDAO.find(cw.targetPayload.capability).then(cap => {
                  console.log('CANCELLED ' +
                    cap.name
                  );
                })
              }
            );
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
            title: this.targetPayload.capability,
            customView: {
              class: 'foam.u2.view.MultiChoiceView',
              choices$: this.choices$,
              booleanView: this.CardSelectView,
              isValidNumberOfChoices$: this.isValid$,
              showValidNumberOfChoicesHelper: false,
              minSelected$: this.min$,
              maxSelected$: this.max$,
              onSelect: this.adjustCapablePayloads.bind(this)
            }
          })
        ];
      }
    }
  ],

  methods: [
    {
      name: 'adjustCapablePayloads',
      code: function(oldChoices, newChoices) {
        var choiceWizardlets = this.choiceWizardlets;

        var selectedOldChoicesNames = oldChoices.map(choice => choice[0]);
        var selectedNewChoicesNames = newChoices.map(choice => choice[0]);

        if ( selectedOldChoicesNames.length > selectedNewChoicesNames.length ){
          var deselectedChoiceName = selectedOldChoicesNames.filter(choice => selectedNewChoicesNames.indexOf(choice) == -1)[0]

          var deselectedChoice = oldChoices.filter(choice => choice[0] === deselectedChoiceName)[0];

          var deselectedWizard = choiceWizardlets.filter(wizard => wizard.title === deselectedChoice[0]);

          var { targetPayload } =  deselectedWizard[0];

          this.capable.getCapablePayloadDAO().remove(
            targetPayload).then(() => {
              this.capabilityDAO.find(targetPayload.capability).then(cap => {
              console.log('CANCELLED ' +
                cap.name
              );
            })
            }
          );

        } else if (selectedOldChoicesNames.length < selectedNewChoicesNames.length ) {

          var selectedChoiceName = selectedNewChoicesNames.filter(choice => selectedOldChoicesNames.indexOf(choice) == -1)[0]

          var selectedChoice = newChoices.filter(choice => choice[0] === selectedChoiceName)[0];
          
          var selectedWizard = choiceWizardlets.filter(wizard => wizard.title === selectedChoice[0]);

          var { targetPayload } =  selectedWizard[0];

          this.capable.getCapablePayloadDAO().put(
            targetPayload).then(() => {
              this.capabilityDAO.find(targetPayload.capability).then(cap => {
                console.log('SAVED ' +
                  cap.name
                );
              })
            });

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
