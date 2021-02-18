

foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'CapabilityJunctionTransistionToStatus',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  
  documentation: `Returns true if the capability of the ucj submitted is transistioning to status defined.`,
  
  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Reference',
      name: 'capabilityId',
      of: 'foam.nanos.crunch.Capability',
      documentation: `Used to catch any ucj's with their targetId equaling this value.`
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      documentation: `Status to check compare to the new ucj's status. (ie. ucj's transistion to status provided.)`,
      javaFactory: `
        return foam.nanos.crunch.CapabilityJunctionStatus.PENDING;
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction new = (UserCapabilityJunction) x.get("NEW");

        return old != null &&
            ! old.getStatus().equals(new.getStatus()) &&
            new.getStatus().equals(getStatus()) &&
            new.getTargetId().equals(getCapabilityId());
      `
    }
  ]
});
