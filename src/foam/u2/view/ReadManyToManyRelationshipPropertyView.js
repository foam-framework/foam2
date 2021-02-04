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
    'memento',
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

      this.tag(this.ScrollTableView, {
        data: this.data.dao,
        enableDynamicTableHeight: false,
        config: this.config
      });
    },
    function click(obj, id) {
      if ( ! this.stack ) return;

      this.stack.push({
        class: 'foam.comics.v2.DAOSummaryView',
        data: obj,
        config: this.config,
        idOfRecord: id
      }, this.__subContext__.createSubContext({memento: this.memento.tail}));
    }
  ]
});
