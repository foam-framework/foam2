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
    'userCapabilityJunctionDAO'
  ],
  exports: [
    'unfilteredWizardlets'
  ],

  properties: [
    {
      name: 'unfilteredWizardlets',
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
      var currentWizardlet  = currentCap.wizardlet.clone().clone().copyFrom(
        {
          capability: currentCap,
        },
        this.__subContext__
      );

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

            updateUcjPromiseList.push(this.updateUCJ(prereqWizardlet, associatedEntity))
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
        updateUcjPromiseList.unshift(this.updateUCJ(currentWizardlet, associatedEntity));
      } else {  
        updateUcjPromiseList.push(this.updateUCJ(currentWizardlet, associatedEntity));
      }
        
      return updateUcjPromiseList;
    },

    function execute() {
      return Promise.all(
        this.parseArrayToWizards(this.capabilities, null)
      ).then(wizardlets => {
        this.unfilteredWizardlets = wizardlets;
      });
    },
    async function updateUCJ(wizardlet, associatedEntity) {
      return this.userCapabilityJunctionDAO.find(
        this.AND(
          this.OR(
            this.AND(
              this.NOT(this.INSTANCE_OF(this.AgentCapabilityJunction)),
              this.EQ(this.UserCapabilityJunction.SOURCE_ID, associatedEntity.id)
            ),
            this.AND(
              this.INSTANCE_OF(this.AgentCapabilityJunction),
              this.EQ(this.UserCapabilityJunction.SOURCE_ID, associatedEntity.id),
              this.EQ(this.AgentCapabilityJunction.EFFECTIVE_USER, this.subject.user.id)
            )
          ),
          this.EQ(this.UserCapabilityJunction.TARGET_ID, wizardlet.capability.id)
        )
      ).then(ucj => {
        wizardlet.ucj = ucj;
        return wizardlet;
      });
    }
  ]
});