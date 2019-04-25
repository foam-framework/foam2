/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.mlang',
  name: 'Table',
  extends: 'foam.dao.DAOSink',
  requires: [
    'foam.dao.ArrayDAO',
    'foam.u2.view.TableView',
  ],
  properties: [
    {
      name: 'dao',
      expression: function(of) {
        return this.ArrayDAO.create({of: of});
      },
    },
    {
      class: 'Class',
      name: 'of',
    },
    {
      name: 'view',
      expression: function(of, dao, columns) {
        if ( ! of ) return 'No results';
        var tv = this.TableView.create({ data: dao });
        if ( columns.length ) {
          tv.columns = columns.map(function(c) { return of.getAxiomByName(c) });
        }
        return tv;
      },
    },
    {
      class: 'StringArray',
      name: 'columns',
    },
  ],
  methods: [
    function put(o) {
      if ( ! this.of ) this.of = o.cls_
      this.SUPER(o);
    },
    function toE(_, x) {
      return x.E().add(this.view$);
    },
  ]
});
