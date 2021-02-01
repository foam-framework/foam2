/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'Capability',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  imports: [
    'capabilityDAO'
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

  requires: [
    'foam.u2.crunch.EasyCrunchWizard'
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
      section: 'basicInfo',
      includeInDigest: false
    },
    {
      name: 'icon',
      class: 'Image',
      documentation: `Path to capability icon`,
      section: 'uiSettings',
      includeInDigest: false
    },
    {
      name: 'description',
      class: 'String',
      documentation: `Description of capability`,
      section: 'uiSettings',
      includeInDigest: false
    },
    {
      name: 'notes',
      class: 'String',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12,
        cols: 120
      },
      includeInDigest: false
    },
    {
      name: 'price',
      class: 'Long',
      includeInDigest: true
    },
    {
      name: 'keywords',
      class: 'StringArray',
      includeInDigest: false
    },
    {
      name: 'version',
      class: 'String',
      includeInDigest: true,
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true,
      includeInDigest: true,
      documentation: `Capability is ignored by system when enabled is false.
      user will lose permissions implied by this capability and upper level capabilities will ignore this prerequisite`
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `Datetime of when capability is no longer valid`,
      includeInDigest: true,
    },
    {
      name: 'duration',
      class: 'Int',
      documentation: `To be used in the case where expiry is duration-based, represents the number of DAYS a junction is valid for before expiring.
      The UserCapabilityJunction object will have its expiry configured to a DateTime based on the lower value of the two, expiry and duration`,
      includeInDigest: true,
    },
    {
      name: 'gracePeriod',
      class: 'Int',
      value: 0,
      documentation: `To be used in the case where expiry is duration based, represents the number of DAYS the user can keep permissions
      granted by this capability after the duration runs out.
      If the gracePeriod is greater than 0, the UserCapabilityJunction will set isInGracePeriod property to true
      and set gracePeriod property to be equals to this. Otherwise, the UserCapabilityJunction will
      go into EXPIRED status.`,
      includeInDigest: true,
    },
    {
      name: 'of',
      class: 'Class',
      displayWidth: 70,
      documentation: `Model used to store information required by this credential`,
      includeInDigest: true,
    },
    {
      name: 'inherentPermissions',
      class: 'StringArray',
      documentation: `List of inherent permissions provided by this capability`,
      includeInDigest: true,
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'permissionsGranted',
      class: 'StringArray',
      documentation: `List of permissions granted by this capability`,
      includeInDigest: true,
      view: 'foam.u2.crunch.PermissionsStringArrayView'
    },
    {
      name: 'permissionsIntercepted',
      class: 'StringArray',
      includeInDigest: true,
      documentation: `List of permissions intercepted by this capability`
    },
    {
      name: 'daoKey',
      class: 'String',
      documentation: `
      daoKey.put() done in UserCapabilityJunctionDAO.
      Uses contextDAOFindKey to find object to update/put.`,
      includeInDigest: true
    },
    {
      name: 'contextDAOFindKey',
      class: 'String',
      documentation: 'need to find things dynamically, thus have a string here to specify the object in context to look up.',
      includeInDigest: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'interceptIf',
      networkTransient: true,
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      documentation: 'condition under which the permissions that may be intercepted by this capability will be intercepted.',
      includeInDigest: false
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'availabilityPredicate',
      networkTransient: true,
      javaFactory: 'return foam.mlang.MLang.TRUE;',
      documentation: 'Predicate used to omit or include capabilities from capabilityDAO',
      includeInDigest: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'visibilityPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;',
      documentation: 'Predicate of the visibility for capabilities in the capability store/keyword sections',
      includeInDigest: true
    },
    {
      name: 'grantMode',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityGrantMode',
      value: foam.nanos.crunch.CapabilityGrantMode.AUTOMATIC
    },
    {
      name: 'reviewRequired',
      class: 'Boolean',
      includeInDigest: true,
      permissionRequired: true
    },
    {
      name: 'associatedEntity',
      class: 'Enum',
      of: 'foam.nanos.crunch.AssociatedEntity',
      hidden: true,
      permissionRequired: true,
      includeInDigest: true,
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
        Defines a wizardlet to display this capability in a wizard. This
        wizardlet will display after this capability's prerequisites.
      `,
      factory: function() {
        return foam.nanos.crunch.ui.CapabilityWizardlet.create({}, this);
      },
      includeInDigest: false,
    },
    {
      class: 'Object',
      name: 'beforeWizardlet',
      documentation: `
        A wizardlet to display before this capability's prerequisites, and only
        if this capability is at the end of a prerequisite group returned by
        CrunchService's getCapabilityPath method.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      name: 'wizardConfig',
      documentation: `
        Configuration placed on top level capabilities defining various
        configuration options supported by client capability wizards.
      `,
      includeInDigest: false,
      factory: function() {
        return this.EasyCrunchWizard.create({}, this);
      }
    },
    {
      name: 'requirementViewTitle',
      class: 'String',
      documentation: `A short introduction displayed as subtitle in CapabilityRequirementView`,
      section: 'uiSettings',
      includeInDigest: false,
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
          case PENDING_REVIEW :
            // note: this shouldn't happen since PENDING_REVIEW is
            // only used for UI purposes, and ucjs are never stored
            // in this status
            status = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          default :
            status = CapabilityJunctionStatus.GRANTED;
        }
        return status;

      `
    },
    {
      name: 'maybeReopen',
      type: 'Boolean',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      documentation: `
        Returns true if the ucj or one of its prerequistite ucjs of the target capability
        are granted but not in an reopenable state
      `,
      javaCode: `
        if ( ! getEnabled() ) return false;
        if ( getGrantMode() == CapabilityGrantMode.MANUAL ) return false;

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        boolean shouldReopenTopLevel = shouldReopenUserCapabilityJunction(ucj);
        if ( shouldReopenTopLevel ) return true;

        var prereqs = crunchService.getPrereqs(getId());
        if ( prereqs == null || prereqs.size() == 0 ) return false;

        for ( var capId : prereqs ) {
          Capability cap = (Capability) capabilityDAO.find(capId);
          if ( cap == null ) throw new RuntimeException("Cannot find prerequisite capability");
          UserCapabilityJunction prereq = crunchService.getJunction(x, capId);
          if ( cap.maybeReopen(x, prereq) ) return true;
        }
        return false;
      `
    },
    {
      name: 'shouldReopenUserCapabilityJunction',
      type: 'Boolean',
      args: [
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      javaCode: `
        if ( ucj == null ) return true;
        else if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED && ucj.getIsRenewable() ) return true;
        else if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED &&
                  ucj.getStatus() != CapabilityJunctionStatus.PENDING &&
                  ucj.getStatus() != CapabilityJunctionStatus.APPROVED ) return true;
        return false;
      `
    }
  ]
});


foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  extends:'foam.nanos.crunch.Renewable',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.crunch.Capability',
  ids: [ 'id' ],
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'users',
  sourceProperty: {
    section: 'systemInformation',
    order: 20,
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
