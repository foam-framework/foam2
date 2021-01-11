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
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO userDAO = (DAO) x.get("userDAO");
        Subject currentSubject = (Subject) x.get("subject");

        // Prepare to count statuses
        int numberGranted = 0;
        int numberPending = 0;

        // Create ccJunctions list
        DAO myPrerequisitesDAO = ((DAO)
          x.get("prerequisiteCapabilityJunctionDAO"))
            .where(
              EQ(CapabilityCapabilityJunction.SOURCE_ID, getId()));
        List<CapabilityCapabilityJunction> ccJunctions =
          ((ArraySink) myPrerequisitesDAO.select(new ArraySink()))
          .getArray();

        // Count junction statuses
        for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
          Capability cap = (Capability) ccJunction.findTargetId(x);
          if ( ! cap.getEnabled() ) continue;

          // Use getSubject method of UCJ when NP-2436 (PR 4248) is merged
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

          X subjectContext = x.put("subject", subject);

          UserCapabilityJunction ucJunction =
            crunchService.getJunction(subjectContext, ccJunction.getTargetId());
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
        
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        DAO prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        boolean shouldReopenTopLevel = shouldReopenUserCapabilityJunction(ucj);
        if ( shouldReopenTopLevel ) return true;

        var prereqs = crunchService.getPrereqs(getId());
        if ( prereqs == null || prereqs.size() == 0 ) return false;

        int numberGrantedNotReopenable = 0;
        for ( var capId : prereqs ) {
          Capability cap = (Capability) capabilityDAO.find(capId);
          if ( cap == null ) throw new RuntimeException("Cannot find prerequisite capability");
          UserCapabilityJunction prereq = crunchService.getJunction(x, capId);
          if ( prereq != null && prereq.getStatus() == CapabilityJunctionStatus.GRANTED && ! cap.maybeReopen(x, prereq) )
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
