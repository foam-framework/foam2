/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'PagedTableView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.dao.FnSink',
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView',
    'foam.dao.MergedResetSink',
    'foam.dao.AnonymousSink',
    'foam.mlang.ExpressionsSingleton'
  ],
  exports: [
    'as data'
  ],
  properties: [
    {
      class: 'Int',
      name: 'count',
      visibility: 'RO',
      postSet: function(_, n) {
        this.skip = Math.min(this.skip, n - this.limit);
      },
    },
    {
      class: 'Int',
      name: 'skip',
      preSet: function(_, v) {
        return Math.max(0, Math.min(v, this.count - this.limit));
      },
      value: 0
    },
    {
      class: 'Int',
      name: 'limit',
      label: 'Page Size',
      value: 50
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'pagedDAO',
      view: 'foam.u2.view.TableView',
      expression: function(data, limit, skip) {
        return data.skip(skip).limit(limit);
      },
    }
  ],
  actions: [
    {
      name: 'first',
      isEnabled: function(skip) { return skip > 0 },
      code: function() { this.skip = 0 },
    },
    {
      name: 'next',
      isEnabled: function(skip, limit, count) { return skip < count - limit },
      code: function() { this.skip += this.limit },
    },
    {
      name: 'prev',
      isEnabled: function(skip, limit, count) { return skip > 0 },
      code: function() { this.skip -= this.limit },
    },
    {
      name: 'last',
      isEnabled: function(skip, limit, count) { return skip < count - limit },
      code: function() { this.skip = this.count - this.limit },
    },
  ],
  listeners: [
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        this.data$proxy.select(this.Count.create()).then(function(count) {
       debugger;
          this.count = count.value;
        }.bind(this));

      },
    },
  ],
  methods: [
    function initE() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.updateCount })));
      this.updateCount();
      this.
        start('div').
          style({ 'display': 'flex' }).
          start().
            add(this.FIRST, this.PREV).
          end().
          start().
            style({
              'flex-grow': '1',
              'text-align': 'center',
            }).
            add(this.slot(function(skip, limit, count) {
                return `${skip + 1} - ${Math.min(skip + limit, count)} of ${count}`
            })).
            br().
            add(this.LIMIT.label, this.LIMIT).
          end().
          start().
            add(this.NEXT, this.LAST).
          end().
        end().
        add(this.PAGED_DAO)
    },
  ],
});
