/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomListView',
  extends: 'foam.u2.View',
  requires: [
    'foam.doc.Axiom',
    'foam.doc.AxiomLink',
    'foam.doc.dao.AxiomDAO',
    'foam.mlang.sink.Count',
  ],
  implements: [
    'foam.mlang.Expressions',
  ],
  properties: [
    {
      class: 'String',
      name: 'modelID',
    },
    {
      class: 'Class',
      name: 'of',
      value: 'foam.doc.Axiom',
    },
    {
      name: 'axiomDAO',
      expression: function(modelID) {
        return this.AxiomDAO.create({ modelIDs: [modelID] })
      },
    },
    {
      name: 'titleFn',
    },
  ],
  css: `
    ^ .commaseparated span:after {
      content: ", ";
    }
    ^ .commaseparated span:last-child:after {
      content: "";
    }
  `,
  methods: [
    function initE() {
      this.SUPER();

      var of = this.of;
      var titleFn = this.titleFn;
      var titleTag = this.titleTag;
      var modelID = this.modelID;
      var AxiomLink = this.AxiomLink;

      var dao = this.axiomDAO.where(
        this.AND(
          this.INSTANCE_OF(of),
          this.EQ(this.Axiom.HAS_PERMISSION, true),
          this.EQ(this.Axiom.PARENT_ID, modelID)))

      this.add(this.slot(function(sink) {
        return this.E().
          addClass(this.myClass()).
          callIf(sink.value, function() {
            this.
              callIf(titleFn, function() { this.add(titleFn()) }).
              start('code').
                addClass('commaseparated').
                select(dao, function(a) {
                  return this.E('span').
                    start(AxiomLink, { cls: modelID, axiomName: a.name }).end()
                }).
              end()
          })
      }, this.daoSlot(dao, this.Count.create())))
    },
  ],
});
