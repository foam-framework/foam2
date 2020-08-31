/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'PutFinalJunctionsAgent',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilities',
    'crunchService',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    function execute() {
      // TODO: replace with CrunchService methods when possible.
      //   At the time of writing this comment, CrunchService does
      //   not have a method to create the correct empty UCJ when
      //   none already exists.

      // Save no-data capabilities (i.e. not displayed in wizard)
      return Promise.all(this.capabilities.filter(cap => ! cap.of).map(
        cap => {
          var associatedEntity = cap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
          this.userCapabilityJunctionDAO.find(
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
              this.EQ(this.UserCapabilityJunction.TARGET_ID, cap.id))
          ).then((ucj) => {
            // TODO: should be calling save
            if ( ucj == null ) {
              ucj = this.UserCapabilityJunction.create({
                sourceId: associatedEntity.id,
                targetId: cap.id
              });
            }
            this.userCapabilityJunctionDAO.put(ucj).then(() => console.log('SAVED (no-data cap)', cap.id));
          });
        }
      ));
    }
  ]
});
