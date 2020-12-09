/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableObjectData',

  properties: [
    {
      name: 'capablePayloads',
      class: 'FObjectArray',
      // javaType: 'java.util.List<foam.nanos.crunch.crunchlite.CapablePayload>',
      of: 'foam.nanos.crunch.CapabilityJunctionPayload',
      section: 'capabilityInformation'
    },
    {
      name: 'userCapabilityRequirements',
      class: 'StringArray',
      section: 'capabilityInformation'
    },
    {
      name: 'isWizardIncomplete',
      class: 'Boolean',
      section: 'systemInformation',
      transient: true,
      hidden: true
    },
    {
      class: 'StringArray',
      name: 'capabilityIds',
      section: 'capabilityInformation'
    },
    {
      class: 'String',
      name: 'daoKey',
      section: 'capabilityInformation'
    }
  ],

  methods: [
    {
      // TODO: investigate why this default implementation doesn't
      //   work when put in the Capable interface itself; this
      //   behaviour works with mlang.Expressions so it's odd that
      //   it doesn't work for this case.
      name: 'setRequirements',
      flags: ['web'],
      code: function(capabilityIds) {
        this.capabilityIds = capabilityIds;
      }
    },
    {
      name: 'getCapablePayloadDAO',
      flags: ['web'],
      code: function () {
        return this.CapableAdapterDAO.create({
          capable: this
        });
      }
    }
  ]
});
