/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CheckPendingAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilityDAO',
    'capabilities',
    'crunchService',
    'ctrl',
    'endSequence',
    'rootCapability',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  exports: [
    'cancelled'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  properties: [
    {
      name: 'cancelled',
      class: 'Boolean'
    }
  ],

  messages: [
    { name: 'CANNOT_OPEN_GRANTED', message: 'This capability has already been granted to you' },
    { name: 'CANNOT_OPEN_PENDING', message: 'This capability is awaiting approval, updates are not permitted at this time' },
    { name: 'CANNOT_OPEN_ACTION_PENDING', message: 'This capability is awaiting review, updates are not permitted at this time' }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      var capability = this.rootCapability;
      var associatedEntity = capability.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
      var ucj = await this.userCapabilityJunctionDAO.find(
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
          this.EQ(this.UserCapabilityJunction.TARGET_ID, capability.id)
        )
      );
      
      var shouldReopen = false;
      if ( ucj ) {
        var statusPending = ucj.status === this.CapabilityJunctionStatus.PENDING;
        var shouldReopen = await this.crunchService.maybeReopen(this.ctrl.__subContext__, ucj.targetId);
        if ( ! shouldReopen ) {
          var message = statusPending ? this.CANNOT_OPEN_PENDING : this.CANNOT_OPEN_GRANTED;
          this.ctrl.notify(message, '', this.LogLevel.INFO, true);
          this.cancelled = true;
          this.endSequence();
          return;
        }
      }
      if ( shouldReopen && this.capabilities.length < 1 ) {
        // This is here because of a CertifyDataReviewed capability.
        this.ctrl.notify(this.CANNOT_OPEN_ACTION_PENDING);
        this.cancelled = true;
        this.endSequence();
      }
    }
  ]
});

