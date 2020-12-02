/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CrunchLab',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ svg {
      height: calc(100% - 40px); /* temp */
    }
    ^ .foam-u2-view-RichChoiceView-selection-view {
      width: 30vw;
    }
  `,

  imports: [
    'memento',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.graph.GraphBuilder',
    'foam.nanos.crunch.UserCapabilityJunction',
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
      of: 'foam.nanos.crunch.Capability',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Capabilities',
              dao: X.capabilityDAO
            }
          ]
        };
      },
      postSet: function(_, n) {
        this.memento = n;
      }
    },
    {
      name: 'crunchUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO
            }
          ]
        };
      },
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
            .add(this.CRUNCH_USER)
            .add(this.getGraphSlot(true))
          .end()
        .end()
        ;
      this.memento$.sub(this.mementoChange);
      this.mementoChange();
    },
    function getGraphSlot(replaceWithUCJ) {
      var self = this;
      return this.slot(function (rootCapability, crunchUser, relation) {
        if ( ! rootCapability ) return this.E();
        var graphBuilder = self.GraphBuilder.create();

        // Having these variables here makes promise returns cleaner
        var rootCapabilityObj = null;
        var placementPlan = null;
        var graph = null;

        return self.rootCapability$find
          .then(o => {
            rootCapabilityObj = o;
            return graphBuilder.fromRelationship(o, self.relation)
          })
          .then(() => {
            graph = graphBuilder.build();
            return self.RelationshipGridPlacementStrategy.create({
              graph: graph,
            }).getPlan();
          })
          .then(placementPlan_ => {
            placementPlan = placementPlan_;
            if ( replaceWithUCJ ) {
              capabilityIds = Object.keys(graph.data);
              return self.userCapabilityJunctionDAO.where(self.AND(
                self.IN(self.UserCapabilityJunction.TARGET_ID, capabilityIds),
                self.EQ(self.UserCapabilityJunction.SOURCE_ID, crunchUser)
              )).select().then(r => {
                r.array.forEach(ucj => {
                  console.log('replacing', ucj.targetId, ucj);
                  let capability = graph.data[ucj.targetId].data;
                  graph.data[ucj.targetId].data = [
                    capability, ucj
                  ];
                })
              })
            }
          })
          .then(() => {
            placementPlan = this.IdPropertyPlacementPlanDecorator.create({
              delegate: placementPlan,
              targetProperty: 'id'
            });
            return this.E()
              .tag(self.TreeGraph, {
                nodePlacementPlan: placementPlan,
                graph: graph,
                size: 200,
                nodeView: 'foam.u2.crunch.lab.CapabilityGraphNodeView'
                // nodeView: 'foam.u2.svg.graph.ZoomedOutFObjectGraphNodeView'
              })
              ;
          })
      });
    }
  ],

  listeners: [
    function mementoChange() {
      var m = this.memento;
      if ( m && this.rootCapability != m ) this.rootCapability = m;
    }
  ]
});