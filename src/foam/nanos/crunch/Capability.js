foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Capability',

  imports: [
    'capabilityDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
  ],

  requires: [
    'foam.nanos.auth.Permission'
  ],

  ids: [
    'name'
  ],

  properties: [
    // {
    //   name: 'id',
    //   class: 'Long',
    //   documentation: `handled by the SequenceNumberDAO`
    // },
    {
      name: 'name',
      class: 'String',
      documentation: `name of the capability`
    }, 
    {
      name: 'icon',
      class: 'String',
      documentation: `path to capability icon`
    },
    {
      name: 'description',
      class: 'String',
      documentation: `description of capability`
    },
    {
      name: 'notes',
      class: 'String'
    },
    {
      name: 'version',
      class: 'String'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true,
      documentation: `capability is ignored by system when enabled is false`
    },
    {
      name: 'visible',
      class: 'Boolean',
      documentation: `hide sub-capabilities which aren't top-level and individually selectable. when true, capability is visible to the user`
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `datetime of when capability is no longer valid`
    },
    {
      name: 'of',
      class: 'Class',
      documentation: `model used to store information required by this credential`
    },
    {
      name: 'capabilitiesRequired',
      class: 'StringArray',
      documentation: `prerequisite capabilities required to unlock this capability`
    }
  ],


  methods: [
    {
      name: 'implies',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'permission', type: 'foam.nanos.auth.Permission' }
      ],
      documentation: `checks if passed permission is in the list of this.capability.capabilitiesRequired.`,
      code: function implies(x, permission) {
        this.capabilitiesRequired.forEach(function(capabilityName) {
          capabilityDAO.find(capabilityName).then((capability) => {
            if(capability.implies(x, permission)) return true;
          });
        });
        return false;
      },
      javaCode: `
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        String[] prereqs = this.getCapabilitiesRequired();
        for(String capabilityName : prereqs) {
          Capability capability = (Capability) capabilityDAO.find(capabilityName);
          if(capability.implies(x, permission)) return true;
        }
        return false;
      `
    },
  ]
});

foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'user',
  sourceProperty: {
    hidden: true
  }
});

