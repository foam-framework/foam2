foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'CapabilityCapabilityJunctionDAO',
    extends: 'foam.dao.ProxyDAO',
  
    documentation: `TODO On the junctionDAO put should set all deprecated capabilities' enabled to false and update UserCapabilityJunction.`,
  
    javaImports: [
      'foam.nanos.crunch.Capability',
      'foam.nanos.crunch.UserCapabilityJunction',
      'foam.nanos.crunch.CapabilityJunctionStatus',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'java.util.List',
      'static foam.mlang.MLang.*'
    ],
  
    methods: [
      {
        name: 'put_', 
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'obj',
            type: 'foam.core.FObject'
          }
        ],
        type: 'foam.core.FObject',
        documentation: `
          when a deprecated/deprecatedBy relationship is put into the CapabilityCapabilityJunctionDAO, 
          set the deprecated capability to enabled false, and set the userCapabilityJunctions where
          the capabilityId is the deprecated capability to status deprecated.
          maybe this should also change the status that use the deprecated capability as prerequisite
        `,
        javaCode: `
        CapabilityCapabilityJunction junction = (CapabilityCapabilityJunction) getDelegate().put_(x, obj);

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");

        Capability deprecated = (Capability) capabilityDAO.find(junction.getSourceId());
        Capability deprecating = (Capability) capabilityDAO.find(junction.getTargetId());

        deprecated = (Capability) deprecated.fclone();
        deprecated.setEnabled(false);
        capabilityDAO.put(deprecated);

        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        // TODO update the usercapabilityjunctions
        List<UserCapabilityJunction> userCapabilityJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
          .where(EQ(UserCapabilityJunction.TARGET_ID, deprecated.getId()))
          .select(new ArraySink()))
          .getArray();

        for(UserCapabilityJunction ucJunction : userCapabilityJunctions) {
          UserCapabilityJunction j = (UserCapabilityJunction) ucJunction.fclone();
          j.setStatus(CapabilityJunctionStatus.DEPRECATED);
          userCapabilityJunctionDAO.put(j);
        }

        return junction;
        `
      },
    ]
  });
  