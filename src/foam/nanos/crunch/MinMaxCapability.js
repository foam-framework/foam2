/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'MinMaxCapability',
  extends: 'foam.nanos.crunch.Capability',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.ui.MinMaxCapabilityWizardlet'
  ],

  properties: [
    {
      name: 'of',
      hidden: true,
      value: "foam.nanos.crunch.MinMaxCapabilityData",
      javaFactory:`
        return foam.nanos.crunch.MinMaxCapabilityData.getOwnClassInfo();
      `
    },
    {
      name: 'min',
      class: 'Int',
      value: 1
    },
    {
      name: 'max',
      class: 'Int',
      value: 0
    },
    {
      class: 'Object',
      name: 'beforeWizardlet',
      documentation: `
        Defines a wizardlet used when displaying this capability on related client crunch wizards.
      `,
      factory: function() {
        return foam.nanos.crunch.ui.MinMaxCapabilityWizardlet.create({}, this);
      },
      javaFactory: `
        return new MinMaxCapabilityWizardlet();
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
        return foam.nanos.crunch.ui.CapabilityWizardlet.create({isVisible: false}, this);
      },
      includeInDigest: false,
    },
  ],

  methods: [
    {
      name: 'getPrereqsChainedStatus',
      type: 'CapabilityJunctionStatus',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ucj', type: 'UserCapabilityJunction' }
      ],
      javaCode: `
        // Required services and DAOs
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Subject junctionSubject = (Subject) ucj.getSubject(x);

        // Prepare to count statuses
        int numberGranted = 0;
        int numberPending = 0;

        // Get list of prerequisite capability ids
        List<String> prereqCapabilityIds = crunchService.getPrereqs(getId());

        // this is under the assumption that minmaxCapabilities should always have prerequisites
        // and that min is never less than 1
        if ( prereqCapabilityIds == null || prereqCapabilityIds.size() == 0 ) return CapabilityJunctionStatus.ACTION_REQUIRED;

        // Count junction statuses
        for ( String capId : prereqCapabilityIds ) {
          Capability cap = (Capability) capabilityDAO.find(capId);
          if ( ! cap.getEnabled() ) continue;

          X junctionSubjectContext = x.put("subject", junctionSubject);

          UserCapabilityJunction ucJunction =
            crunchService.getJunction(junctionSubjectContext, capId);
          if ( ucJunction.getStatus() == AVAILABLE ) continue;

          switch ( ucJunction.getStatus() ) {
            case GRANTED:
              numberGranted++;
              break;
            case PENDING:
            case APPROVED:
              numberPending++;
              break;
          }
        }

        if ( numberGranted >= getMin() ) {
          return CapabilityJunctionStatus.GRANTED;
        }
        if ( numberGranted + numberPending >= getMin() ) {
          return CapabilityJunctionStatus.PENDING;
        }
        return CapabilityJunctionStatus.ACTION_REQUIRED;
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
        Returns true if the number of prereqs granted but not in an reopenable state
        is less than 'min'
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

        int numberGrantedNotReopenable = 0;
        for ( var capId : prereqs ) {
          Capability cap = (Capability) capabilityDAO.find(capId);
          if ( cap.getGrantMode() == CapabilityGrantMode.MANUAL ) {
            numberGrantedNotReopenable++;
            continue;
          }
          if ( cap == null ) throw new RuntimeException("Cannot find prerequisite capability");
          UserCapabilityJunction prereq = crunchService.getJunction(x, capId);
          if ( prereq != null && ! cap.maybeReopen(x, prereq) )
            numberGrantedNotReopenable++;
        }
        // if there are at least min number granted not reopenable, then no need to reopen capability
        return numberGrantedNotReopenable < getMin();
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
