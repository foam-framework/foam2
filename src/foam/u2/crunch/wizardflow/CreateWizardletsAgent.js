/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CreateWizardletsAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  imports: [
    'subject',
    'capabilities',
    'crunchService',
    'userCapabilityJunctionDAO'
  ],
  exports: [
    'wizardlets'
  ],

  properties: [
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    }
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.MinMaxCapability',
  ],

  methods: [
    function parseArrayToWizards(array, parentWizardlet){
      var isOr = foam.nanos.crunch.MinMaxCapability.isInstance(array[array.length - 1]) ? true : false;
      var updateUcjPromiseList = [];

      var currentCap = array[array.length - 1];
      var currentWizardlet  = currentCap.wizardlet.clone().copyFrom(
        {
          capability: currentCap,
        },
        this.__subContext__
      );
      var associatedEntity;
      array.slice(0, array.length - 1).forEach(
        prereqCap => {
          if ( Array.isArray(prereqCap) ){
            updateUcjPromiseList = updateUcjPromiseList.concat(this.parseArrayToWizards(prereqCap, currentWizardlet));
          } else {
            var prereqWizardlet = prereqCap.wizardlet.clone().copyFrom(
              {
                capability: prereqCap
              },
              this.__subContext__
            );
  
            associatedEntity = prereqCap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;

            if (isOr){
              prereqWizardlet.isAvailable = false;
              currentWizardlet.choiceWizardlets.push(prereqWizardlet);
            } else {
              prereqWizardlet.isAvailable$.follow(currentWizardlet.isAvailable$);
            }

            updateUcjPromiseList.push(prereqWizardlet.load())
          }
        }
      )

      if ( parentWizardlet !== null ){
        if ( foam.nanos.crunch.ui.MinMaxCapabilityWizardlet.isInstance(parentWizardlet)  ){
          currentWizardlet.isAvailable = false;
          parentWizardlet.choiceWizardlets.push(currentWizardlet);
        } else {
          currentWizardlet.isAvailable$.follow(parentWizardlet.isAvailable$);
        }      
      }

      //  in cases of min max, the min max wizard has to appear first before all it's prereqs in order to select appropriately
      if ( isOr ){
        updateUcjPromiseList.unshift(currentWizardlet.load());
      } else {  
        updateUcjPromiseList.push(currentWizardlet.load());
      }
        
      return updateUcjPromiseList;
    },

    function execute() {
      return Promise.all(
        this.parseArrayToWizards(this.capabilities, null)
      ).then(wizardlets => {
        this.wizardlets = wizardlets;
      });
    }
  ]
});