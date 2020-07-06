/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'crunchController',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability'
    },
    {
      name: 'ucj'
    },

    // Properties for WizardSection interface
    {
      name: 'of',
      class: 'Class',
      expression: function (capability) {
        return capability.of;
      }
    },
    {
      name: 'data',
      factory: function () {
        if ( ! this.of ) return null;

        var ret = this.of.create({}, this);
        if ( this.ucj === null ) return ret;
      
        ret = Object.assign(ret, this.ucj.data);
        return ret;
      }
    },
    {
      name: 'title',
      expression: function(capability) {
        return capability.name;
      }
    }
  ],

  methods: [
    {
      name: 'save',
      code: function() {
        var isAssociationCapability = foam.nanos.crunch.AssociationCapability.isInstance(this.capability);
        var associatedEntity = isAssociationCapability ? this.subject.realUser : 
          this.capability.associatedEntity === 'user' ? this.subject.user : this.subject.realUser;

        return this.updateUCJ(associatedEntity).then(() => {
          var ucj = this.ucj;
          if ( ucj === null ) {
            ucj = isAssociationCapability ? 
              this.AgentCapabilityJunction.create({
                sourceId: associatedEntity.id,
                targetId: this.capability.id,
                effectiveUser: this.subject.user.id
              })
              : this.UserCapabilityJunction.create({
                sourceId: associatedEntity.id,
                targetId: this.capability.id
              })
          }
          if ( this.of ) ucj.data = this.data;
          return this.userCapabilityJunctionDAO.put(ucj);
        });
      }
    },
    {
      // This can be moved to an expression on the 'data' property
      // iff property expressions unwrap promises.
      name: 'updateUCJ',
      async: true,
      code: function (associatedEntity) {
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
            this.EQ(this.UserCapabilityJunction.TARGET_ID, this.capability.id)
          )
        ).then(ucj => {
          this.ucj = ucj;
          return this;
        });
      }
    }
  ]
});
