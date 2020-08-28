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
    function execute() {
      return Promise.all(this.capabilities
        .reduce((updateUCJPromiseList, cap) => {
          var associatedEntity, wizardlet;
            
          if ( Array.isArray(cap) && ( foam.nanos.crunch.MinMaxCapability.isInstance(cap[cap.length - 1]) ) ){
            var minMaxCap = cap[cap.length - 1];

            minMaxArray = [];

            var choiceWizardlets = cap.slice(0, cap.length - 1).map(
              capability => {
                wizardlet = capability.wizardlet.cls_.create(
                { 
                  capability: capability, 
                  isAvailable: false,
                  ...capability.wizardlet.instance_ 
                }, this)

                associatedEntity = capability.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;

                minMaxArray.push(this.updateUCJ(wizardlet, associatedEntity))

                // TODO:  also instantiate updateUCJ for the choice prereqs and push to promise array
                // TODO: slot the prereqs isAvaialble to wizardlet.isAvailable$
                return wizardlet;
              }
            )
            var minMaxWizardlet = foam.nanos.crunch.ui.MinMaxCapabilityWizardlet.create({
              capability: minMaxCap,
              ...minMaxCap.wizardlet.instance_,
              choiceWizardlets: choiceWizardlets
            })

            associatedEntity = minMaxCap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
            
            minMaxArray.unshift(this.updateUCJ(minMaxWizardlet, associatedEntity));
            updateUCJPromiseList = updateUCJPromiseList.concat(minMaxArray);
            

          } else if ( cap.of ) {
            associatedEntity = cap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
            wizardlet = cap.wizardlet.cls_.create({ capability: cap, ...cap.wizardlet.instance_ }, this);

            updateUCJPromiseList.push(this.updateUCJ(wizardlet, associatedEntity));
          }

          return updateUCJPromiseList
        }, [])
      ).then(wizardlets => {
        this.wizardlets = wizardlets.filter(wizardlet => {
          return wizardlet.ucj === null ||
          (
            wizardlet.ucj.status != this.CapabilityJunctionStatus.GRANTED &&
            wizardlet.ucj.status != this.CapabilityJunctionStatus.PENDING
          )
        });
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