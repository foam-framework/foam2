foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'OrCapability',
  extends: 'foam.nanos.crunch.Capability',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'java.util.ArrayList',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'minPrerequisites',
      class: 'Int'
    }
  ],

  methods: [
    {
      name: 'hasPrerequisitesSatisfied',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ucjDaoKey', type: 'String' },
        { name: 'ucjUserPredicate', type: 'Predicate' },
      ],
      documentation: `
        Check if this capability has the minimum number of prerequisites.
      `,
      javaCode: `
        // Get a list of prerequisite capabilities
        List<String> myPrerequisites = new ArrayList<String>();
        {
          DAO myPrerequisitesDAO = ((DAO)
            x.get("prerequisiteCapabilityJunctionDAO"))
              .where(
                EQ(CapabilityCapabilityJunction.SOURCE_ID, getId()));

          List<CapabilityCapabilityJunction> prerequisiteJunctions =
            ((ArraySink) myPrerequisitesDAO.select(new ArraySink()))
            .getArray();

          for ( CapabilityCapabilityJunction pj : prerequisiteJunctions ) {
            Capability c = (Capability)
              ((DAO) x.get("capabilityDAO"))
              .find(pj.getTargetId());
            myPrerequisites.add(c.getId());
          }
        }

        System.out.println(String.format("prereqs len %d", myPrerequisites.size()));

        // Get prerequisite UCJs
        List<UserCapabilityJunction> myPrerequisiteUCJs = null;
        {
          DAO ucjDAO = (DAO) x.get(ucjDaoKey);
          myPrerequisiteUCJs = ((ArraySink) ucjDAO
            .where(
              AND(
                ucjUserPredicate,
                IN(
                  UserCapabilityJunction.TARGET_ID,
                  myPrerequisites))
            )
            .select(new ArraySink())
          ).getArray();
        }

        int count = 0;

        // Iterate over prerequisite UCJs to check status
        for ( UserCapabilityJunction ucj : myPrerequisiteUCJs ) {
          if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
            count++;
          }
        }

        return count >= this.getMinPrerequisites();
      `
    }
  ]
});