/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadManyToManyRelationshipPropertyView',
  extends: 'foam.u2.View',

  exports: [
    'click',
    'click as dblclick'
  ],

  imports: [
    'stack'
  ],

  documentation: 'A read-only view of a ManyToManyRelationshipProperty.',

  requires: [
    'foam.u2.view.ScrollTableView',
    'foam.comics.v2.DAOControllerConfig'
  ],

  property: [
    'config'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.config = this.DAOControllerConfig.create({ dao: this.data.dao.delegate });


      var view = foam.u2.ViewSpec.createView(this.ScrollTableView, {
        data: this.data.dao,
        enableDynamicTableHeight: false,
        config: this.config
      },
      this,
      this.__subContext__.createSubContext({ memento: null }));
      

      this.add(view);
    },
    function click(obj, id) {
      if ( ! this.stack ) return;

      this.stack.push({
        class: 'foam.comics.v2.DAOSummaryView',
        data: obj,
        config: this.config,
        idOfRecord: id,
        backLabel: 'Back'
      }, this.__subContext__.createSubContext({memento: null}));
    }
  ]
});
