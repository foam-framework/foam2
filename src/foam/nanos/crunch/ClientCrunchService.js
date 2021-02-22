/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'ClientCrunchService',

  implements: [
    'foam.nanos.crunch.CrunchService',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.AssociatedEntity',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  imports: [
    'capabilityDAO',
    'userCapabilityJunctionDAO',
    'logger',
    'subject'
  ],


  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.crunch.CrunchService',
      name: 'delegate'
    }
  ],

  methods: [
    {
      name: 'getAssociationPredicate_',
      code: function(x) {
        let user = this.subject.user;
        let realUser = this.subject.realUser;

        let acjPredicate = this.INSTANCE_OF(this.AgentCapabilityJunction);

        return this.OR(
          this.AND(
            this.NOT(acjPredicate),
            ( user != realUser )
              // Check if a ucj implies the subject.user has this permission
              ? this.OR(
                  this.EQ(this.UserCapabilityJunction.SOURCE_ID, realUser.id),
                  this.EQ(this.UserCapabilityJunction.SOURCE_ID, user.id)
                )
              // Check if a ucj implies the subject.realUser has this permission
              : this.EQ(this.UserCapabilityJunction.SOURCE_ID, realUser.id)
          ),
          this.AND(
            acjPredicate,
            // Check if a ucj implies the subject.realUser has this permission in relation to the user
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, realUser.id),
            this.EQ(this.AgentCapabilityJunction.EFFECTIVE_USER, user.id)
          )
        );
      }
    },
    {
      name: 'buildAssociatedUCJ',
      code: async function(x, capabilityId, subject) {
        // Need Capability to associate UCJ correctly
        // If the subject in context doesn't have the capability availabile, we
        // should act as though it doesn't exist; this is why inX is here.
        let cap = await this.capabilityDAO.find(capabilityId);
        if ( cap == null ) {
          throw new Error(`Capability with id ${capabilityId} is either unavailabile or does not exist`);
        }
        let associatedEntity = cap.associatedEntity;
        let isAssociation = associatedEntity == this.AssociatedEntity.ACTING_USER;
        let associatedUser = associatedEntity == this.AssociatedEntity.USER
          ? subject.user
          : subject.realUser
          ;
        let ucj = isAssociation
          ? this.AgentCapabilityJunction.create({
            sourceId: associatedUser.id,
            targetId: capabilityId,
            effectiveUser: subject.user.id
          }, this)
          : this.UserCapabilityJunction.create({
            sourceId: associatedUser.id,
            targetId: capabilityId,
          }, this);
        ucj.status = this.CapabilityJunctionStatus.AVAILABLE;
        return ucj;
      }
    },
    {
      name: 'getJunction',
      code: async function(x, capabilityId) {
        let targetPredicate = this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId);
        try {
          let associationPredicate = this.getAssociationPredicate_(x);
    
          // Check if a ucj implies the subject.realUser has this permission in relation to the user
          let ucj = await this.userCapabilityJunctionDAO.find(this.AND(associationPredicate,targetPredicate));
          if ( ucj == null ) {
            ucj = await this.buildAssociatedUCJ(x, capabilityId, this.subject);
          } else {
            ucj = ucj.clone();
          }
    
          return ucj;
        } catch ( e ) {
          this.logger.error("getJunction", capabilityId, e);

          // On failure, report that the capability is available
          var ucj = await this.buildAssociatedUCJ(x, capabilityId, this.subject);
          return ucj;
        }
      }
    },
    {
      name: 'updateJunction',
      code: async function(x, capabilityId, data, status) {
        let ucj = await this.getJunction(x, capabilityId);

        if ( ucj.status == this.CapabilityJunctionStatus.AVAILABLE && status == null ) {
          ucj.status = this.CapabilityJunctionStatus.ACTION_REQUIRED;
        }

        if ( data != null ) {
          ucj.data = data;
        }
        if ( status != null ) {
          ucj.status = status;
        }
        
        ucj.lastUpdatedRealUser = this.subject.realUser.id;
        return await this.userCapabilityJunctionDAO.put(ucj);
      }
    }
  ]
});

