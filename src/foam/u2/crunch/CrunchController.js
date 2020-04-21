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
    'stack'
  ],

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction'
  ],

  methods: [
    function launchWizard(capabilityId) {
      var self = this;

      var ofList = []; // This is what the wizard wants
      var tcList = []; // but we need this first
      var tcRecurse = () => {}; // and we'll do it with this

      // Pre-Order Traversial of Capability Dependancies.
      // Using Pre-Order here will cause the wizard to display
      // dependancies in a logical order.
      tcRecurse = (sourceId) => {
        return self.prerequisiteCapabilityJunctionDAO.where(
          self.EQ(self.CapabilityCapabilityJunction.SOURCE_ID, sourceId)
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

      // Create "ofList" for the wizard
      let p = tcRecurse(capabilityId).then(() => {
        return self.capabilityDAO.where(
          self.IN(self.Capability.ID, tcList)
        ).select().then((results) => {
          // Get the Capability objects in a map because it's faster than sorting
          var capabilityMap = {};
          results.array.forEach((cap) => capabilityMap[cap.id] = cap);
            // tcList.forEach((capId) => {
            //   console.log(capabilityMap[capId]);
            //   console.log(capabilityMap[capId].daoFindKey);
            // });
            // console.log(this.ctrl);
            // Collect lists for fullfilling the requirements for any given capability.
            ofList = tcList
              .filter((capID) => !! capabilityMap[capID].of)
              .map((capID) => capabilityMap[capID].of);

            daoList = tcList
              .filter((capID) => !! capabilityMap[capID].of && !! capabilityMap[capID].daoKey)
              .map((capID) => capabilityMap[capID].daoKey);

            argsList = tcList
              .filter((capID) => !! capabilityMap[capID].of && !! capabilityMap[capID].daoFindKey)
              .map((capID) =>
                this.ctrl[capabilityMap[capID].daoFindKey].id);
          });
        });
        this.capabilityDAO.find(capabilityId).then((cap) => {
          // Summon the wizard; accio!
          p.then(() => {
            self.stack.push({
              class: 'foam.nanos.crunch.ui.ScrollSectionWizardView',
              title: cap.name,
              daoList: daoList,
              ofList: ofList,
              argsList: argsList,
              capsList: tcList
            });
        });
      });
    }
  ]
});
