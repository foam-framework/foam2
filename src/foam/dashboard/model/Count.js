/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'Count',
  extends: 'foam.dashboard.model.Visualization',
  requires: [
    'foam.dashboard.view.Count as CountView',
    'foam.mlang.sink.Count',
    'foam.mlang.predicate.False',
    'foam.parse.QueryParser',
    'foam.u2.ContextSensitiveDetailView as DetailView'
  ],
  properties: [
    {
      name: 'views',
      factory: function() {
        return [
          [ this.CountView, 'Count' ],
          [ this.DetailView, 'Configure' ]
        ];
      }
    },
    {
      name: 'sink',
      factory: function() {
        return this.Count.create();
      }
    }
  ]
});
