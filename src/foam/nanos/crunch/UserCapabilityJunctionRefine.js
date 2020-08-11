/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.UserCapabilityJunction',

  documentation: `
    Model for UserCapabilityJunction, contains the data needed to grant the
    capability to user.
  `,

  tableColumns: [
    'sourceId',
    'targetId',
    'status',
    'created',
    'expiry',
    'graceDaysLeft',
    'data'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'sourceId',
      label: 'User'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'targetId',
      label: 'Capability',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.capabilityDAO
          .find(value)
          .then((capability) => this.add(capability.name))
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      name: 'created',
      class: 'DateTime',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'expiry',
      class: 'DateTime'
    },
    {
      name: 'data',
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.FObject',
      documentation: `data for capability.of`,
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED
    },
    {
      name: 'graceDaysLeft',
      class: 'Int',
      documentation: `
      Number of days left that a user can use the Capability in this ucj after it goes into GRACE_PERIOD status.
      Set when the ucj is first granted.
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AgentCapabilityJunction',
  extends: 'foam.nanos.crunch.UserCapabilityJunction',

  properties: [
    {
      name: 'effectiveUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      documentation: `
        The entity the owner of this capability 'act as'
      `
    }
  ]
})