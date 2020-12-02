/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapablePayload',
  documentation: `
    Composite object containing a capability ID and an instance of
    payload data. This is similar to a UserCapabilityJunction, but
    it is not associated with a user and has less features.
  `,

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.Validatable',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability'
  ],

  implements: [
    'foam.core.Validatable'
  ],

  // TODO: Can section off view

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
    },
    {
      class: 'Reference',
      name: 'capability',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'data',
      class: 'FObjectProperty'
    },
    {
      name: 'prerequisites',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.lite.CapablePayload',
      documentation: `
        Specifies prerequisites that were not present in the higher-level
        capability path, for example options for a MinMaxCapability.

        To save data to one of these payloads, clone it and add it to the
        parent-most list of CapablePayload objects. The validator will not
        recurse into this list because these payloads may be conditionally
        applicable.
      `,
      javaFactory: `
        return null;
      `,
      permissionRequired: true
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED
    },
    {
      class: 'Boolean',
      name: 'hasSafeStatus',
      documentation: `
        TODO: 
      `,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'needsApproval',
      documentation: `
        TODO: Review with Eric
      `,
      transient: true
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability capability = (Capability) capabilityDAO.find(getCapability());
        ClassInfo dataClass = capability.getOf();
        if ( dataClass == null ) return;
        FObject dataObject = getData();
        if ( dataObject == null ) {
          throw new IllegalStateException(String.format(
            "Missing payload data for capability '%s'",
            capability.getId()
          ));
        }
        if ( ! dataClass.isInstance(dataObject) ) {
          throw new IllegalStateException(String.format(
            "Invalid payload data class for capability '%s'",
            capability.getId()
          ));
        }
        if ( dataObject instanceof Validatable ) {
          dataObject.validate(x);
        }
      `,
    },
    {
      name: 'toSummary',
      code: function(){
        return `${this.daoKey}:${this.objId} - ${this.capability}`
      }
    }
  ],
});
