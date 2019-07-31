/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Capability',

  imports: [
    'capabilityDAO',
    'prerequisiteCapabilityJunctionDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.sink.Count',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  tableColumns: [
    'id',
    'description',
    'version',
    'enabled',
    'visible',
    'expiry',
    'daoKey'
  ],

  properties: [
    
    {
      name: 'id',
      class: 'String'
    }, 
    {
      name: 'icon',
      class: 'Image',
      documentation: `Path to capability icon`
    },
    {
      name: 'description',
      class: 'String',
      documentation: `Description of capability`
    },
    {
      name: 'notes',
      class: 'String',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12, 
        cols: 120
      }
    },
    {
      name: 'version',
      class: 'String'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true,
      documentation: `Capability is ignored by system when enabled is false.
      user will lose permissions implied by this capability and upper level capabilities will ignore this prerequisite`
    },
    {
      name: 'visible',
      class: 'Boolean',
      documentation: `Hide sub-capabilities which aren't top-level and individually selectable. when true, capability is visible to the user`
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `Datetime of when capability is no longer valid`
    },
    {
      name: 'of',
      class: 'Class',
      documentation: `Model used to store information required by this credential`
    },
    {
      name: 'permissionsGranted',
      class: 'StringArray',
      documentation: `List of permissions granted by this capability`
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
      documentation: `Checks if a permission or capability string is implied by the current capability`,
      javaCode: `
        if ( ! this.getEnabled() ) return false;

        // check if permission is a capability string implied by this permission
        if ( this.stringImplies(this.getId(), permission) ) return true;

        String[] permissionsGranted = this.getPermissionsGranted();
        for ( String permissionName : permissionsGranted ) {
          if ( this.stringImplies(permissionName, permission) ) return true; 
        }

        List<CapabilityCapabilityJunction> prereqs = ((ArraySink) this.getPrerequisites(x).getJunctionDAO().where(EQ(CapabilityCapabilityJunction.TARGET_ID, (String) this.getId())).select(new ArraySink())).getArray();

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        for ( CapabilityCapabilityJunction prereqJunction : prereqs ) {
          Capability capability = (Capability) capabilityDAO.find(prereqJunction.getSourceId());
          if ( capability.implies(x, permission) ) return true;
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
      javaCode: `
      if ( s1.equals(s2) ) return true;
      if ( s1.charAt( s1.length() - 1) != '*' || ( s1.length() - 2 > s2.length() ) ) return false;

      if ( s2.length() <= s1.length() - 2 ) return s1.substring( 0, s1.length() -2 ).equals( s2.substring( 0, s1.length() - 2 ) );
      else return s1.substring( 0, s1.length() - 1 ).equals( s2.substring( 0, s1.length() -1 ) );
      `
    },
    {
      name: 'isDeprecated',
      type: 'Boolean',
      args: [
        {name: 'x', type: 'Context'}
      ],
      documentation: 'check if a given capability is deprecated',
      javaCode: `
      Sink count = new Count();
      count = this.getDeprecating(x).getJunctionDAO()
        .where(
          EQ(Capability.ID, (String) this.getId())
        ).select(count);

      return ((Count) count).getValue() > 0;
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
  inverseName: 'users'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',  
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'deprecated',
  inverseName: 'deprecating',
  junctionDAOKey: 'deprecatedCapabilityJunctionDAO'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',  
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'prerequisites',
  inverseName: 'dependents',
  junctionDAOKey: 'prerequisiteCapabilityJunctionDAO'
});
