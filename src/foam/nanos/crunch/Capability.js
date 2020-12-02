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
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  implements: [
    'foam.nanos.auth.EnabledAware'
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
      title: 'Administrative',
      permissionRequired: true
    },
    {
      name: 'basicInfo',
      title: 'Basic Info'
    },
    {
      name: 'uiSettings',
      title: 'UI Settings',
      help: 'These properties are used to control how this capability appears in the GUI.',
      permissionRequired: true
    },
    {
      name: 'capabilityRelationships',
      title: 'Capability Relationships',
      permissionRequired: true
    }
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      displayWidth: 40,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'basicInfo'
    },
    {
      name: 'name',
      class: 'String',
      displayWidth: 70,
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
      If the gracePeriod is greater than 0, the UserCapabilityJunction will set isInGracePeriod property to true
      and set gracePeriod property to be equals to this. Otherwise, the UserCapabilityJunction will
      go into EXPIRED status.`
    },
    {
      name: 'of',
      class: 'Class',
      displayWidth: 70,
      documentation: `Model used to store information required by this credential`
    },
    {
      name: 'inherentPermissions',
      class: 'StringArray',
      documentation: `List of inherent permissions provided by this capability`,
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'permissionsGranted',
      class: 'StringArray',
      documentation: `List of permissions granted by this capability`,
      view: 'foam.u2.crunch.PermissionsStringArrayView'
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
      networkTransient: true,
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      documentation: 'condition under which the permissions that may be intercepted by this capability will be intercepted.'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'availabilityPredicate',
      networkTransient: true,
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      documentation: 'Predicate used to omit or include capabilities from capabilityDAO'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'visibilityPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;',
      documentation: 'Predicate of the visibility for capabilities in the capability store/keyword sections'
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
    },
    {
      class: 'Object',
      name: 'wizardlet',
      documentation: `
        Defines a wizardlet used when displaying this capability on related client crunch wizards.
      `,
      factory: function() {
        return foam.nanos.crunch.ui.CapabilityWizardlet.create({}, this);
      }
    },
    {
      class: 'Object',
      // TODO: rename to wizardConfig; wizardlet config is the property above
      name: 'wizardletConfig',
      documentation: `
        Configuration placed on top level capabilities defining various configuration options supported by client capability wizards.
      `,
      factory: function() {
        return foam.u2.wizard.StepWizardConfig.create({}, this);
      }
    },
    {
      name: 'requirementViewTitle',
      class: 'String',
      documentation: `A short introduction displayed as subtitle in CapabilityRequirementView`,
      section: 'uiSettings'
    }
  ],


  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.name;
      },
      javaCode: `
        return getName();
      `
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

        String[] inherentPermissions = this.getInherentPermissions();
        for ( String permissionName : inherentPermissions ) {
          if ( this.stringImplies(permissionName, permission) ) return true;
        }

        String[] permissionsGranted = this.getPermissionsGranted();
        for ( String permissionName : permissionsGranted ) {
          if ( this.stringImplies(permissionName, permission) ) return true;
        }

        CrunchService crunchService = (CrunchService) x.get("crunchService");
        var prereqs = crunchService.getPrereqs(getId());

        if ( prereqs != null && prereqs.size() > 0 ) {
          DAO capabilityDAO = (DAO) x.get("capabilityDAO");
          for ( var capId : prereqs ) {
            Capability capability = (Capability) capabilityDAO.find(capId);
            if ( capability != null && capability.implies(x, permission) ) return true;
          }
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
      if ( s1.isBlank() || s2.isBlank() ) return false;
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
      name: 'getPrereqsChainedStatus',
      type: 'CapabilityJunctionStatus',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ucj', type: 'UserCapabilityJunction' }
      ],
      documentation: `
        Check statuses of all prerequisite capabilities - returning:
        GRANTED        : If all pre-reqs are in granted status
        PENDING        : If at least one pre-req is in pending/approved status and the rest are granted
        ACTION_REQUIRED: If at least one pre-req is not in pending/approved/granted status
      `,
      javaCode: `
        // CrunchService used to get capability junctions
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        boolean allGranted = true;
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO userDAO = (DAO) x.get("userDAO");
        Subject currentSubject = (Subject) x.get("subject");

        Subject subject = new Subject(x);
        if ( ucj instanceof AgentCapabilityJunction ) {
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
          AgentCapabilityJunction acj = (AgentCapabilityJunction) ucj;
          subject.setUser((User) userDAO.find(acj.getEffectiveUser())); // "user"
        } else if ( ucj.getSourceId() == currentSubject.getUser().getId() ) {
          subject.setUser(currentSubject.getRealUser());
          subject.setUser(currentSubject.getUser());
        } else {
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
        }

        var prereqs = crunchService.getPrereqs(getId());
        CapabilityJunctionStatus prereqChainedStatus = null;
        if ( prereqs != null ) {
          for ( var capId : prereqs ) {
            var cap = (Capability) capabilityDAO.find(capId);
            if ( cap == null || ! cap.getEnabled() ) continue;
            
            UserCapabilityJunction prereqUcj = crunchService.getJunctionForSubject(x, capId, subject);

            prereqChainedStatus = getPrereqChainedStatus(x, ucj, prereqUcj);
            if ( prereqChainedStatus == CapabilityJunctionStatus.ACTION_REQUIRED ) return CapabilityJunctionStatus.ACTION_REQUIRED;
            if ( prereqChainedStatus != CapabilityJunctionStatus.GRANTED ) allGranted = false;
          }
        }
        return allGranted ? CapabilityJunctionStatus.GRANTED : CapabilityJunctionStatus.PENDING;
      `,
    },
    {
      name: 'getPrereqChainedStatus',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' },
        { name: 'prereq', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      static: true,
      javaType: 'foam.nanos.crunch.CapabilityJunctionStatus',
      javaCode: `
        CapabilityJunctionStatus status = ucj.getStatus();

        boolean reviewRequired = getReviewRequired();
        CapabilityJunctionStatus prereqStatus = prereq.getStatus();

        switch ( (CapabilityJunctionStatus) prereqStatus ) {
          case AVAILABLE : 
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case ACTION_REQUIRED : 
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case PENDING : 
            status = reviewRequired && 
              ( status == CapabilityJunctionStatus.APPROVED || 
                status == CapabilityJunctionStatus.GRANTED
              ) ? 
                CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING;
            break;
          case APPROVED : 
            status = reviewRequired && 
              ( status == CapabilityJunctionStatus.APPROVED || 
                status == CapabilityJunctionStatus.GRANTED
              ) ? 
                CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING;
              break;
          case EXPIRED :
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          default : 
            status = CapabilityJunctionStatus.GRANTED;
        }
        return status;

      `
    }
  ]
});


foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  extends:'foam.nanos.crunch.Renewable',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'users',
  sourceProperty: {
    section: 'systemInformation',
    updateVisibility: 'RO'
  }
});


foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CRUNCHThemeRefinement',
  refines: 'foam.nanos.theme.Theme',

  properties: [
    {
      name: 'admissionCapability',
      class: 'String',
      // TODO: Why doesn't a Reference property work here?
      // class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      documentation: 'Specifies the top-level capability that must be granted before we admit a user to the system.'
    }
  ],
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
