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
      display: inline-block;
    }
    ^ .foam-u2-view-RichChoiceView-selection-view {
      width: 30vw;
    }
    ^ .foam-u2-Tabs-tabRow {
      margin-bottom: 30px;
    }

    ^ .foam-u2-Tabs-content > div > div {
      display: inline-flex;
      vertical-align: text-bottom;
      margin-right: 20px;
    }
  `,

  imports: [
    'capabilityDAO',
    'memento',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.graph.GraphBuilder',
    'foam.graph.map2d.RelationshipGridPlacementStrategy',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.DetailPropertyView',
    'foam.u2.Tab',
    'foam.u2.crunch.lab.CapabilityGraphNodeView',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.view.RichChoiceSummaryIdRowView',
    'foam.u2.svg.TreeGraph',
    'foam.u2.svg.graph.DAGView',
    'foam.u2.svg.map2d.IdPropertyPlacementPlanDecorator',
    'foam.u2.Tabs'
  ],

  messages: [
    { name: 'ALL_TAB', message: 'All Capabilities' },
    { name: 'UCJ_TAB', message: 'User-Capability Junction' },
  ],

  properties: [
    {
      class: 'Reference',
      name: 'crunchUser',
      label: 'User',
      of: 'foam.nanos.auth.User',
      help: `User reference used to populate UCJ data on capability graph.
          This user references the sourceId/owner of a user capability junction.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          allowClearingSelection: true,
          rowView: { class: 'foam.u2.view.RichChoiceSummaryIdRowView' },
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO
            }
          ]
        };
      },
      postSet: function(o, n) {
        if ( ! n ) this.clearProperty('effectiveUser');
      }
    },
    {
      class: 'Reference',
      name: 'effectiveUser',
      of: 'foam.nanos.auth.User',
      help: `User reference used to further filter capabilities listed for rootCapability.
          This user references the effectiveUser of a capabilityJunction.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          allowClearingSelection: true,
          rowView: { class: 'foam.u2.view.RichChoiceSummaryIdRowView' },
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
      class: 'Reference',
      name: 'rootCapability',
      of: 'foam.nanos.crunch.Capability',
      help: `Root capability reference used to populate graph.
          Graph renders prerequisites downward of the selected capabilty.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          allowClearingSelection: true,
          rowView: { class: 'foam.u2.view.RichChoiceSummaryIdRowView' },
          sections: [
            {
              heading: 'Capabilities',
              dao$: X.data.slot(function(showAllCapabilities, effectiveUser, crunchUser) {
                if ( crunchUser == 0 || showAllCapabilities) return this.capabilityDAO;
                let predicate = effectiveUser ?
                    this.AND(
                      this.EQ(this.AgentCapabilityJunction.SOURCE_ID, crunchUser),
                      this.EQ(this.AgentCapabilityJunction.EFFECTIVE_USER, effectiveUser)
                    ) :
                    this.EQ(this.UserCapabilityJunction.SOURCE_ID, crunchUser);
                return this.PromisedDAO.create({
                  of: 'foam.nanos.crunch.Capability',
                  promise: this.userCapabilityJunctionDAO.where(predicate)
                    .select(this.MAP(this.UserCapabilityJunction.TARGET_ID))
                    .then((sink) => {
                      let capabilities = sink.delegate.array ? sink.delegate.array : [];
                      return this.capabilityDAO.where(
                        this.IN(this.Capability.ID, capabilities.flat())
                      );
                    })
                });
              })
            }
          ]
        };
      },
      postSet: function(_, n) {
        if ( this.memento ) {
          if ( n )
            this.currentMemento_ = foam.nanos.controller.Memento.create({value: n});
          else
            this.currentMemento_ = null;
        }
      }
    },
    {
      class: 'Boolean',
      name: 'showAllCapabilities',
      value: true,
      help: `Toggles dropdown list to contain all capabilities instead 
          of a filtered list based on user selections`
    },
    {
      name: 'relation',
      class: 'String',
      value: 'prerequisites'
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      if ( this.memento) {
        this.currentMemento_$ = this.memento.tail$;
      }

      this
        .addClass(this.myClass())
        .start('h2').add(this.cls_.name).end()
        .start(this.Tabs)
          .start(this.Tab, {
            label: this.ALL_TAB,
            selected: true,
          })
            .tag(this.SectionedDetailPropertyView, { data: this, prop: this.ROOT_CAPABILITY })
            .start().style({ display: 'block' }).add(this.getGraphSlot()).end()
          .end()
          .start(this.Tab, {
            label: this.UCJ_TAB,
          })  
            .tag(this.SectionedDetailPropertyView, { data: this, prop: this.ROOT_CAPABILITY })
            .tag(this.SectionedDetailPropertyView, { data: this, prop: this.CRUNCH_USER })
            .tag(this.SectionedDetailPropertyView, { data: this, prop: this.EFFECTIVE_USER })
            .tag(this.SectionedDetailPropertyView, { data: this, prop: this.SHOW_ALL_CAPABILITIES })
            .start().style({ display: 'block' }).add(this.getGraphSlot(true)).end()
          .end()
        .end()
        ;

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
                self.OR(
                  self.EQ(self.UserCapabilityJunction.SOURCE_ID, this.crunchUser),
                  self.EQ(self.UserCapabilityJunction.SOURCE_ID, this.effectiveUser),
                  self.AND(
                    self.EQ(self.AgentCapabilityJunction.SOURCE_ID, this.crunchUser),
                    self.EQ(self.AgentCapabilityJunction.EFFECTIVE_USER, this.effectiveUser)
                  )
                )
              )).select().then(r => {
                r.array.forEach(ucj => {
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
            window._testing = {};
            window._testing.placementPlan = placementPlan;
            window._testing.graph = graph;
            return this.E()
              .tag(self.DAGView, {
                gridPlacement: placementPlan,
                graph: graph,
                nodeView: this.CapabilityGraphNodeView,
                cellSize: 200,
                zoom: 0.7
              })
              ;
          });
      });
    }
  ],

  listeners: [
    function mementoChange() {
      var m = this.currentMemento_;
      if ( m && this.rootCapability != m.head ) this.rootCapability = m.head;
    }
  ]
});
