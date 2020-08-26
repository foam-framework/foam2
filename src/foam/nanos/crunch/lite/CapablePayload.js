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
    'foam.core.Validator'
  ],

  implements: [
    'foam.core.Validator'
  ],

  properties: [
    {
      name: 'capability',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'data',
      class: 'FObjectProperty'
    },
    {
      name: 'prerequisites',
      class: 'FObjectArray',
      of: 'CapablePayload',
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
      `
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        // TODO: Unsure about this; somebody should verify
        Validator validator = (Validator) getData();
        validator.validate(x, getData());
      `,
    }
  ],
});
