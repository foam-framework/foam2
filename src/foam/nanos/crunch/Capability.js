foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Capability',

  imports: [
    'capabilityDAO',
    'prerequisiteCapabilityJunctionDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.crunch.Capability',
    'java.util.List',
    'static foam.mlang.MLang.*',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  ids: [
    'name'
  ],

  tableColumns: [
    'name',
    'description',
    'version',
    'enabled',
    'visible',
    'expiry',
    'daoKey'
  ],

  properties: [
    
    {
      name: 'name',
      class: 'String',
      documentation: `name/id of the capability`
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
      documentation: `capability is ignored by system when enabled is false.
      user will lose permissions implied by this capability and upper level capabilities will ignore this prerequisite?`
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
      name: 'permissionsGranted',
      class: 'StringArray',
      documentation: `list of permissions granted by this capability`
    },
    {
      name: 'daoKey',
      class: 'String',
      visibility: 'RO'
    }
  ],


  methods: [
    {
      name: 'implies',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'permission', type: 'String' }
      ],
      documentation: `checks if a permission or capability string is implied by the current capability`,
      code: function implies(x, permission) {
        if(!this.enabled) return false;

        if(this.stringImplies(this.name, permission)) return true;

        this.permissionsGranted.forEach(function(permissionName) {
          if(permission === permissionName || this.stringImplies(permissionName, permission)) return true;
        });
        this.prerequisiteCapabilityJunctionDAO.where(this.EQ(this.CapabilityCapabilityJunction.TARGET_ID, this.id))
          .select().then(function(sink) {
            var prerequisites = sink.array
            prerequisites.forEach(function(prereq) {
              this.capabilityDAO.find(prereq.sourceId).then(function(cap) {
                if(cap.implies(x, permission)) return true;
              });
            })
          });
        return false;
      },
      javaCode: `
        if(!this.getEnabled()) return false;

        // check if permission is a capability string implied by this permission
        if(this.stringImplies(this.getName(), permission)) return true;

        String[] permissionsGranted = this.getPermissionsGranted();
        for(String permissionName : permissionsGranted) {
          if(permission.equals(permissionName) || this.stringImplies(permissionName, permission)) return true; 
        }
        DAO prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
        List<CapabilityCapabilityJunction> prereqs = (List<CapabilityCapabilityJunction>) ((ArraySink) prerequisiteCapabilityJunctionDAO
        .where(EQ(CapabilityCapabilityJunction.TARGET_ID, (String) this.getId()))
        .select(new ArraySink()))
        .getArray();

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        for(CapabilityCapabilityJunction prereqJunction : prereqs) {
          Capability capability = (Capability) capabilityDAO.find(prereqJunction.getSourceId());
          if(capability.implies(x, permission)) return true;
        }
        return false;
      `
    },
    {
      name: 'stringImplies',
      type: 'Boolean',
      args: [
        {name: 's1', type: 'String'},
        {name: 's2', type: 'String'}
      ],
      documentation: `check if s1 implies s2 where s1 and s2 are permission or capability strings`,
      code: function stringImplies(s1, s2) {
        if(s1[s1.length - 1] !== '*' || ( s1.length - 2 > s2.length )) return false;
        if(s2.length <= s1.length - 2) return s1.substring(0, s1.length - 2) === s2.substring(0, s1.length -2);
        else return s1.substring(0, s1.length - 1) === s2.substring(0, s1.length - 1);
      },
      javaCode: `
      if(s1.charAt(s1.length() - 1) != '*' || (s1.length() - 2 > s2.length())) return false;

      if(s2.length() <= s1.length() - 2) return s1.substring(0, s1.length() -2).equals(s2.substring(0, s1.length() - 2));
      else return s1.substring(0, s1.length() - 1).equals(s2.substring(0, s1.length() -1));
      `
    }
  ]
});

foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'user'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',  
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'cap1',
  inverseName: 'cap2'
});

// deprecatedCapabilityJunction
// source is deprecated
// target is deprecating

// prerequisiteCapabilityJunction
// source is prerequisite
// target is one requiring prerequisite

