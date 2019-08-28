/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Table',
  extends: 'foam.dashboard.model.Visualization',
  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.dashboard.view.DAOTable',
    'foam.u2.ContextSensitiveDetailView as DetailView',
    'foam.mlang.sink.NullSink',
  ],
  properties: [
    {
      class: 'Int',
      name: 'limit',
      value: 5,
    },
    {
      name: 'columns',
      hidden: true
    },
    {
      name: 'views',
      factory: function() {
        return [
          [ this.DAOTable, 'Table' ],
          [ this.DetailView, 'Configure' ],
        ]
      }
    },
  ],
  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        // no-op
      }
    }
  ]
});
