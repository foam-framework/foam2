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
    'foam.nanos.auth.User'
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
      name: 'wizardlet',
      documentation: `
        Defines a wizardlet used when displaying this capability on related client crunch wizards.
      `,
      factory: function() {
        return foam.nanos.crunch.ui.MinMaxCapabilityWizardlet.create({}, this);
      }
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
        int numberPendingReview = 0;

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
            case PENDING_REVIEW:
              numberPendingReview++;
              break;
          }
        }

        if ( numberGranted >= getMin() ) {
          return CapabilityJunctionStatus.GRANTED;
        }
        if ( numberGranted + numberPending >= getMin() ) {
          return CapabilityJunctionStatus.PENDING;
        }
        if ( numberGranted + numberPending + numberPendingReview >= getMin() ) {
          return CapabilityJunctionStatus.PENDING_REVIEW;
        }
        return CapabilityJunctionStatus.ACTION_REQUIRED;
      `
    }
  ]
});
