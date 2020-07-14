/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
    'foam.u2.svg.graph.IdPropertyPlacementPlanDecorator',
    'foam.u2.svg.TreeGraph',
    'foam.u2.Tab',
    'foam.u2.Tabs'
  ],

  messages: [
    { name: 'ALL_TAB', message: 'All Capabilities' },
    { name: 'UCJ_TAB', message: 'User-Capability Junction' },
  ],

  properties: [
    {
      name: 'rootCapability',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'crunchUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
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
        .start(this.Tabs)
          .start(this.Tab, {
            label: this.ALL_TAB,
            selected: true,
          })
            .add(this.ROOT_CAPABILITY)
            .add(this.getGraphSlot())
          .end()
          .start(this.Tab, {
            label: this.UCJ_TAB,
          })
            .add(this.ROOT_CAPABILITY)
            .add(this.getGraphSlot())
          .end()
        .end()
        ;
    },
    function getGraphSlot() {
      var self = this;
      return this.slot(function (rootCapability, relation) {
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
            placementPlan = this.IdPropertyPlacementPlanDecorator.create({
              delegate: placementPlan,
              targetProperty: 'id'
            });
            return this.E()
              .tag(self.TreeGraph, {
                nodePlacementPlan: placementPlan,
                relationshipPropertyName: self.relation,
                rootObject: rootCapabilityObj,
                size: 200,
                // nodeView: 'foam.u2.crunch.lab.CapabilityGraphNodeView'
                nodeView: 'foam.u2.svg.graph.ZoomedOutFObjectGraphNodeView'
              })
              ;
          })
      });
    }
  ],
});