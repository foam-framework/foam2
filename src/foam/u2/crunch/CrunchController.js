foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CrunchController',
  documentation: `
    Defines behaviour for invocation of CRUNCH-related views.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilityDAO',
    'ctrl',
    'prerequisiteCapabilityJunctionDAO',
    'stack',
    'user',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.ui.CapabilityWizardSection'
  ],

  methods: [
    function getTC(capabilityId) {
      var tcList = [];
      var tcRecurse = () => {}; // and we'll do it with this

      // Pre-Order Traversial of Capability Dependancies.
      // Using Pre-Order here will cause the wizard to display
      // dependancies in a logical order.
      tcRecurse = (sourceId) => {
        return this.prerequisiteCapabilityJunctionDAO.where(
          this.EQ(this.CapabilityCapabilityJunction.SOURCE_ID, sourceId)
        ).select().then((result) => {
          var arry = result.array;

          if ( arry.length == 0 ) {
            tcList.push(sourceId);
            return;
          }

          return arry.reduce(
            (p, pcj) => p.then(() => tcRecurse(pcj.targetId)),
            Promise.resolve()
          ).then(() => tcList.push(sourceId));
        });
      };

      return tcRecurse(capabilityId).then(() => tcList);
    },
    function getCapabilities(capabilityId) {
      return this.getTC(capabilityId).then(
        tcList => Promise.all(tcList.map(
          capId => this.capabilityDAO.find(capId))));
    },
    function launchWizard(capabilityId) {
      var self = this;

      this.getCapabilities(capabilityId).then(capabilities => {
        // Map capabilities to CapabilityWizardSection objects
        return Promise.all(capabilities.filter(
          cap => cap.of
        ).map(
          cap => this.CapabilityWizardSection.create({
            capability: cap
          }).updateUCJ()
        ));
      }).then(sections => {
        console.log(sections);
        self.stack.push({
          class: "foam.nanos.crunch.ui.ScrollSectionWizardView",
          sectionsList: sections
        });
      });

    }
  ]
});
