foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CrunchLab',
  extends: 'foam.u2.Controller',

  css: `
    ^ svg {
      height: calc(100% - 40px); /* temp */
    }
  `,

  requires: [
    'foam.graph.GraphBuilder',
    'foam.u2.svg.graph.RelationshipGridPlacementStrategy',
    'foam.u2.svg.TreeGraph',
  ],

  properties: [
    {
      name: 'rootCapability',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'relation',
      class: 'String',
      value: 'prerequisites'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.ROOT_CAPABILITY)
        .add(this.slot(function (rootCapability, relation) {
          if ( ! rootCapability ) return this.E();
          var graphBuilder = self.GraphBuilder.create();
          var rootCapabilityObj = null;
          return self.rootCapability$find
            .then(o => {
              rootCapabilityObj = o;
              return graphBuilder.fromRelationship(o, self.relation)
            })
            .then(() => {
              return self.RelationshipGridPlacementStrategy.create({
                graph: graphBuilder.build()
              }).getPlan();
            })
            .then(placementPlan => {
              return this.E()
                .tag(self.TreeGraph, {
                  nodePlacementPlan: placementPlan,
                  relationshipPropertyName: self.relation,
                  rootObject: rootCapabilityObj,
                })
                ;
            })
          return this.E()
            .add(this.TreeGraph, {
              nodePlacementPlan
            })
        }))
        ;
    }
  ],
});