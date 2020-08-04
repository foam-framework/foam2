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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  tableColumns: [
    'id',
    'name',
    'description',
    'version',
    'enabled',
    'visible',
    'expiry',
    'daoKey'
  ],

  sections: [
    {
      name: '_defaultSection',
      title: 'Administrative'
    },
    {
      name: 'basicInfo',
      title: 'Basic Info'
    },
    {
      name: 'uiSettings',
      title: 'UI Settings',
      help: 'These properties are used to control how this capability appears in the GUI.'
    },
    {
      name: 'capabilityRelationships',
      title: 'Capability Relationships'
    }
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'basicInfo'
    },
    {
      name: 'name',
      class: 'String',
      section: 'basicInfo'
    },
    {
      name: 'icon',
      class: 'Image',
      documentation: `Path to capability icon`,
      section: 'uiSettings'
    },
    {
      name: 'description',
      class: 'String',
      documentation: `Description of capability`,
      section: 'uiSettings'
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
      name: 'price',
      class: 'Long'
    },
    {
      name: 'keywords',
      class: 'StringArray'
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
      documentation: `Hide sub-capabilities which aren't top-level and individually selectable. when true, capability is visible to the user`,
      section: 'uiSettings'
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `Datetime of when capability is no longer valid`
    },
    {
      name: 'duration',
      class: 'Int',
      documentation: `To be used in the case where expiry is duration-based, represents the number of DAYS a junction is valid for before expiring.
      The UserCapabilityJunction object will have its expiry configured to a DateTime based on the lower value of the two, expiry and duration`
    },
    {
      name: 'gracePeriod',
      class: 'Int',
      value: 0,
      documentation: `To be used in the case where expiry is duration based, represents the number of DAYS the user can keep permissions
      granted by this capability after the duration runs out.
      If the gracePeriod is greater than 0, the UserCapabilityJunction will go
      into GRACE_PERIOD status with the property graceDaysLeft set to be equals to this property. Otherwise, the UserCapabilityJunction will
      go into EXPIRED status.`
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
      name: 'permissionsIntercepted',
      class: 'StringArray',
      documentation: `List of permissions intercepted by this capability`
    },
    {
      name: 'daoKey',
      class: 'String',
      documentation: `
      daoKey.put() done in UserCapabilityJunctionDAO.
      Uses contextDAOFindKey to find object to update/put.`
    },
    {
      name: 'contextDAOFindKey',
      class: 'String',
      documentation: 'need to find things dynamically, thus have a string here to specify the object in context to look up.'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'interceptIf',
      javaFactory: `
      return foam.mlang.MLang.TRUE;
      `,
      documentation: 'condition under which the permissions that may be intercepted by this capability will be intercepted.'
    },
    {
      name: 'lastModified',
      class: 'DateTime',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      section: '_defaultSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO
          .where(obj.EQ(foam.nanos.auth.User.ID, value))
          .limit(1)
          .select(obj.PROJECTION(foam.nanos.auth.User.LEGAL_NAME))
          .then(function(result) {
            if ( ! result || result.array.size < 1 || ! result.array[0]) {
              this.add(value);
              return;
            }
            this.add(result.array[0]);
          }.bind(this));
      }
    },
    {
      name: 'reviewRequired',
      class: 'Boolean',
      permissionRequired: true
    },
    {
      name: 'associatedEntity',
      class: 'Enum',
      of: 'foam.nanos.crunch.AssociatedEntity',
      hidden: true,
      permissionRequired: true,
      documentation: `
        Denotes which entity in the context subject the capability should be saved to when there are mutiple.
      `,
      factory: () => {
        return foam.nanos.crunch.AssociatedEntity.USER;
      },
      javaFactory: `
        return foam.nanos.crunch.AssociatedEntity.USER;
      `
    }
  ],


  methods: [
    {
      name: 'toSummary',
      code: function() {
        return this.name;
      }
    },
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
        if ( this.stringImplies(this.getName(), permission) ) return true;

        String[] permissionsGranted = this.getPermissionsGranted();
        for ( String permissionName : permissionsGranted ) {
          if ( this.stringImplies(permissionName, permission) ) return true;
        }

        List<CapabilityCapabilityJunction> prereqs = ((ArraySink) this.getPrerequisites(x).getJunctionDAO().where(EQ(CapabilityCapabilityJunction.SOURCE_ID, (String) this.getId())).select(new ArraySink())).getArray();

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        for ( CapabilityCapabilityJunction prereqJunction : prereqs ) {
          Capability capability = (Capability) capabilityDAO.find(prereqJunction.getTargetId());
          if ( capability.implies(x, permission) ) return true;
        }
        return false;
      `
    },
    {
      name: 'stringImplies',
      type: 'Boolean',
      args: [
        { name: 's1', type: 'String' },
        { name: 's2', type: 'String' }
      ],
      documentation: `check if s1 implies s2 where s1 and s2 are permission or capability strings`,
      javaCode: `
      if ( s1.equals(s2) ) return true;
      if ( s1.charAt( s1.length() - 1) != '*' || ( s1.length() - 2 > s2.length() ) ) return false;
      if ( s2.length() <= s1.length() - 2 ) return s1.substring( 0, s1.length() -2 ).equals( s2.substring( 0, s1.length() - 2 ) );
      return s1.substring( 0, s1.length() - 1 ).equals( s2.substring( 0, s1.length() -1 ) );
      `
    },
    {
      name: 'isDeprecated',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' }
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
    {
      name: 'isExpired',
      type: 'Boolean',
      documentation: `check if a given capability is expired.`,
      javaCode: `
      if ( getExpiry() == null ) return false;

      Date today = new Date();
      Date capabilityExpiry = getExpiry();

      return today.after(capabilityExpiry);
      `
    },
    {
      name: 'getJunction',
      type: 'foam.nanos.crunch.UserCapabilityJunction',
      documentation: `
        answers the question "does the context have this capability granted?"
      `,
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        User realUser = ((Subject) x.get("subject")).getRealUser();

        Predicate acjPredicate = INSTANCE_OF(AgentCapabilityJunction.class);
        Predicate targetPredicate = EQ(UserCapabilityJunction.TARGET_ID, getId());
        try {
          DAO capabilityDAO = ( x.get("localCapabilityDAO") == null ) ? (DAO) x.get("capabilityDAO") : (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
          
          {
            // Check if a ucj implies the subject.user has this permission
            Predicate userPredicate = AND(
              NOT(INSTANCE_OF(AgentCapabilityJunction.class)),
              EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
            );
            UserCapabilityJunction ucj = (UserCapabilityJunction)
              userCapabilityJunctionDAO.find(AND(userPredicate,targetPredicate));
            if ( ucj != null ) {
              return ucj;
            }
          }

          // Check if a ucj implies the subject.realUser has this permission
          if ( realUser != null ) {
            Predicate userPredicate = AND(
              NOT(INSTANCE_OF(AgentCapabilityJunction.class)),
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId())
            );
            UserCapabilityJunction ucj = (UserCapabilityJunction)
              userCapabilityJunctionDAO.find(AND(userPredicate,targetPredicate));
            if ( ucj != null ) {
              return ucj;
            }
          }

          // Check if a ucj implies the subject.realUser has this permission in relation to the user
          if ( realUser != null ) {
            Predicate userPredicate = AND(
              INSTANCE_OF(AgentCapabilityJunction.class),
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
              EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId())
            );
            UserCapabilityJunction ucj = (UserCapabilityJunction)
              userCapabilityJunctionDAO.find(AND(userPredicate,targetPredicate));
            if ( ucj != null ) {
              return ucj;
            }
          }

        } catch ( Exception e ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("getJunction", getId());
        }

        return null;
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
  inverseName: 'users',
  sourceProperty: {
    section: 'capabilities',
    updateVisibility: 'RO'
  }
});

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CRUNCHUserRefinement',
  refines: 'foam.nanos.auth.User',
  sections: [{ name: 'capabilities' }]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'deprecated',
  inverseName: 'deprecating',
  junctionDAOKey: 'deprecatedCapabilityJunctionDAO',
  sourceProperty: {
    section: 'capabilityRelationships'
  },
  targetProperty: {
    section: 'capabilityRelationships'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.crunch.Capability',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'prerequisites',
  inverseName: 'dependents',
  junctionDAOKey: 'prerequisiteCapabilityJunctionDAO',
  sourceProperty: {
    section: 'capabilityRelationships'
  },
  targetProperty: {
    section: 'capabilityRelationships'
  }
});
