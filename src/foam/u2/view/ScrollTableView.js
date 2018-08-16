/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'ScrollTableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.dao.FnSink',
    'foam.graphics.ScrollCView',
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'Int',
      name: 'limit',
      value: 18,
      // TODO make this a funciton of the height.
    },
    {
      class: 'Int',
      name: 'skip',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'scrolledDAO',
      expression: function(data, limit, skip) {
        return data.limit(limit).skip(skip);
      },
    },
    'columns',
    {
      class: 'Int',
      name: 'daoCount'
    },
    'selection'
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.listen(this.FnSink.create({fn:this.onDAOUpdate})));
      this.onDAOUpdate();
    },

    function initE() {
      // TODO probably shouldn't be using a table.
      this.start('table').
        on('wheel', this.onWheel).
        start('tr').
          start('td').
            style({ 'vertical-align': 'top' }).
            start(this.TableView, {data$: this.scrolledDAO$, columns: this.columns, selection$: this.selection$}).
            end().
          end().
          start('td').style({ 'vertical-align': 'top' }).
            add(this.ScrollCView.create({
              value$: this.skip$,
              extent$: this.limit$,
              height: 40*18+41, // TODO use window height.
              width: 18,
              size$: this.daoCount$,
            })).
          end().
        end().
      end();
    }
  ],

  listeners: [
    {
      name: 'onWheel',
      code: function(e) {
        var negative = e.deltaY < 0;
        // Convert to rows, rounding up. (Therefore minumum 1.)
        var rows = Math.ceil(Math.abs(e.deltaY) / /*self.rowHeight*/ 40);
        this.skip = Math.max(0, this.skip + (negative ? -rows : rows));
        if ( e.deltaY !== 0 ) e.preventDefault();
      }
    },
    {
      // TODO: Avoid onDAOUpdate approaches.
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data$proxy.select(this.Count.create()).then(function(s) {
          self.daoCount = s.value;
        })
      },
    },
  ]
});
