/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomSummaryView',
  extends: 'foam.u2.View',
  requires: [
    'foam.doc.Axiom',
    'foam.doc.AxiomTableView',
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
      class: 'String',
      name: 'title',
    },
  ],
  methods: [
    function initE() {
      this.SUPER();
      var of = this.of;
      var title = this.title;
      var modelID = this.modelID;
      var AxiomTableView = this.AxiomTableView;

      var dao = this.axiomDAO.where(
        this.AND(
          this.INSTANCE_OF(of),
          this.EQ(this.Axiom.HAS_PERMISSION, true),
          this.EQ(this.Axiom.PARENT_ID, modelID)))

      this.add(this.slot(function(sink) {
        return this.E().
          callIf(sink.value, function() {
            this.
              callIf(title, function() {
                this.start('h5').add(title).end()
              }).
              start(AxiomTableView, { data: dao, of: of }).
              end()
          })
      }, this.daoSlot(dao, this.Count.create())))
    },
  ],
});
