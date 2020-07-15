/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AssociationCapability',
  extends: 'foam.nanos.crunch.Capability',

  documentation: `
    A capability that a user has in relation to another entity.
  `,

  properties: [
    {
      name: 'associatedEntity',
      factory: () => { return foam.nanos.crunch.AssociatedEntity.REAL_USER; },
      javaFactory: `
        return foam.nanos.crunch.AssociatedEntity.REAL_USER;
      `
    }
  ]
});
