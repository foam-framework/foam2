/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadManyToManyRelationshipPropertyView',
  extends: 'foam.u2.View',

  documentation: 'A read-only view of a ManyToManyRelationshipProperty.',

  requires: [
    'foam.u2.view.ScrollTableView'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.tag(this.ScrollTableView, {
        data: this.data.dao,
        enableDynamicTableHeight: false
      });
    }
  ]
});
