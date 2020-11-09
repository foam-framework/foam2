/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.extra',
  name: 'ImplyReviewedAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        // In case this rule action is misconfigured
        if ( ! (obj instanceof Capability) ) {
          throw new RuntimeException(
            "ImplyReviewedAction can only be triggered on Capability objects");
        }

        // Context requirements
        var capabilityDAO = (DAO) x.get("capabilityDAO");

        var cap = (Capability) obj;

        // Find the review wizard corresponding to this capability. A list is
        //   used in case there is more than one.
        List reviewWizards = ((ArraySink) capabilityDAO.where(AND(
          INSTANCE_OF(ReviewWizard.class),
          EQ(ReviewWizard.CAPABILITY_TO_REVIEW, cap.getId())
        )).select(new ArraySink())).getArray();
        for ( Object o : reviewWizards ) {
          var reviewWizard = (ReviewWizard) o;
          grantReview(x, reviewWizard);
        }

      `
    },
    {
      name: 'grantReview',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'reviewWizard', type: 'ReviewWizard' },
      ],
      javaCode: `
        var capabilityDAO = (DAO) x.get("capabilityDAO");
        var crunchService = (CrunchService) x.get("crunchService");

        var caps = (ReviewCapability[]) ((ArraySink) capabilityDAO.where(AND(
          IN(Capability.ID, crunchService.getPrereqs(reviewWizard.getId())),
          INSTANCE_OF(ReviewCapability.class)
        )).select(new ArraySink())).getArray().toArray(new ReviewCapability[0]);

        // Default data for a reviewed ReviewCapability
        var data = new ReviewCapabilityData.Builder(x)
          .setReviewed(true)
          .build();

        // Apply data to each ReviewCapability
        for ( ReviewCapability cap : caps ) {
          crunchService.updateJunction(x, cap.getId(), data, null);
        }

        // Grant final review capability
        crunchService.updateJunction(x, reviewWizard.getId(), null, null);
      `
    }
  ]
});